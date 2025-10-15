using Intranet.Api.DTOs;

namespace Intranet.Api.Services;

public interface IModuleVisibilityService
{
    Task<IReadOnlyList<ModuleDto>> GetVisibleModulesAsync(int userId, bool isSuperAdmin, bool denyList = true, CancellationToken cancellationToken = default);
}
