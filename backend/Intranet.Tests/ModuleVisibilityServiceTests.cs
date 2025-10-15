using System.Linq;
using Intranet.Api.Data;
using Intranet.Api.Entities;
using Intranet.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace Intranet.Tests;

public class ModuleVisibilityServiceTests
{
    private static IntranetDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<IntranetDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var context = new IntranetDbContext(options);
        context.Database.EnsureDeleted();
        context.Database.EnsureCreated();
        return context;
    }

    private static ModuleVisibilityService CreateService(IntranetDbContext context)
    {
        var cache = new MemoryCache(new MemoryCacheOptions());
        return new ModuleVisibilityService(context, cache, NullLogger<ModuleVisibilityService>.Instance);
    }

    [Fact]
    public async Task DenyListMode_RemovesExplicitDenies()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        var modules = await service.GetVisibleModulesAsync(userId: 2, isSuperAdmin: false, denyList: true);

        Assert.DoesNotContain(modules, m => m.Path == "/administration");
        Assert.DoesNotContain(modules, m => m.Path == "/services");
        Assert.Contains(modules, m => m.Path == "/catalogue");
    }

    [Fact]
    public async Task AllowListMode_ReturnsOnlyWhitelistedModules()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        var modules = await service.GetVisibleModulesAsync(userId: 3, isSuperAdmin: false, denyList: false);

        Assert.Equal(new[] { "/catalogue", "/agenda", "/administration" }, modules.Select(m => m.Path).ToArray());
    }

    [Fact]
    public async Task SuperAdmin_SeesAllActiveModules()
    {
        using var context = CreateContext();
        var service = CreateService(context);

        var modules = await service.GetVisibleModulesAsync(userId: 1, isSuperAdmin: true, denyList: true);

        Assert.Contains(modules, m => m.Path == "/administration");
        Assert.Equal(5, modules.Count);
    }

    [Fact]
    public async Task InactiveModules_AreHiddenForEveryone()
    {
        using var context = CreateContext();
        context.Modules.Add(new Module
        {
            Id = 99,
            Name = "Archives",
            Path = "/archives",
            Icon = "archive",
            Order = 10,
            Section = "general",
            IsActive = false
        });
        context.SaveChanges();

        var service = CreateService(context);
        var modules = await service.GetVisibleModulesAsync(userId: 1, isSuperAdmin: true, denyList: true);

        Assert.DoesNotContain(modules, m => m.Path == "/archives");
    }
}
