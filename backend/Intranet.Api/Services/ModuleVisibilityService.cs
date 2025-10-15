using Microsoft.Extensions.Logging;
using Intranet.Api.Data;
using Intranet.Api.DTOs;
using Intranet.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace Intranet.Api.Services;

public class ModuleVisibilityService : IModuleVisibilityService
{
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

    private readonly IntranetDbContext _context;
    private readonly IMemoryCache _cache;
    private readonly ILogger<ModuleVisibilityService> _logger;

    public ModuleVisibilityService(IntranetDbContext context, IMemoryCache cache, ILogger<ModuleVisibilityService> logger)
    {
        _context = context;
        _cache = cache;
        _logger = logger;
    }

    public async Task<IReadOnlyList<ModuleDto>> GetVisibleModulesAsync(int userId, bool isSuperAdmin, bool denyList = true, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"sidebar:{userId}:{isSuperAdmin}:{denyList}";
        if (_cache.TryGetValue(cacheKey, out IReadOnlyList<ModuleDto>? cached))
        {
            return cached;
        }

        IQueryable<Module> query = _context.Modules.AsNoTracking();

        if (isSuperAdmin)
        {
            query = query.Where(m => m.IsActive);
        }
        else if (denyList)
        {
            query = query
                .Where(m => m.IsActive)
                .Where(m => !m.UserPermissions.Any(up => up.UserId == userId && !up.CanView));
        }
        else
        {
            query = query
                .Where(m => m.IsActive)
                .Where(m => m.UserPermissions.Any(up => up.UserId == userId && up.CanView));
        }

        var modules = await query
            .OrderBy(m => m.Order ?? 9999)
            .ThenBy(m => m.Name)
            .Select(m => new ModuleDto(m.Id, m.Name, m.Path, m.Icon, m.Order, m.Section))
            .ToListAsync(cancellationToken);

        _cache.Set(cacheKey, modules, new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = CacheDuration
        });

        // NOTE: Invalidate this cache when module/user permission data changes (e.g. listen to EF Core SaveChanges events).
        _logger.LogDebug("Sidebar cache refreshed for user {UserId} (superAdmin: {IsSuperAdmin}, denyList: {DenyList})", userId, isSuperAdmin, denyList);

        return modules;
    }
}
