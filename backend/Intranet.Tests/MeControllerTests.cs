using System.Linq;
using System.Net.Http.Json;
using Intranet.Api.Data;
using Intranet.Api.DTOs;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Intranet.Tests;

public class MeControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public MeControllerTests(WebApplicationFactory<Program> baseFactory)
    {
        _factory = baseFactory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<IntranetDbContext>));
                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                services.AddDbContext<IntranetDbContext>(options =>
                {
                    options.UseInMemoryDatabase("MeControllerTests");
                });

                using var scope = services.BuildServiceProvider().CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<IntranetDbContext>();
                db.Database.EnsureDeleted();
                db.Database.EnsureCreated();
            });
        });
    }

    [Fact]
    public async Task SidebarEndpoint_ReturnsVisibleModulesForUser()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-User-Id", "2");

        var response = await client.GetAsync("/api/me/sidebar-modules");
        response.EnsureSuccessStatusCode();

        var modules = await response.Content.ReadFromJsonAsync<List<ModuleDto>>();
        Assert.NotNull(modules);
        Assert.DoesNotContain(modules!, m => m.Path == "/services");
        Assert.Contains(modules!, m => m.Path == "/catalogue");
    }

    [Fact]
    public async Task SidebarEndpoint_SuperAdminSeesAll()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-User-Id", "1");

        var response = await client.GetAsync("/api/me/sidebar-modules");
        response.EnsureSuccessStatusCode();

        var modules = await response.Content.ReadFromJsonAsync<List<ModuleDto>>();
        Assert.NotNull(modules);
        Assert.Equal(5, modules!.Count);
    }
}
