using System.Security.Claims;
using Intranet.Api.DTOs;
using Intranet.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Intranet.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MeController : ControllerBase
{
    private readonly IModuleVisibilityService _moduleVisibilityService;
    private readonly IOptions<SidebarVisibilityOptions> _visibilityOptions;

    public MeController(IModuleVisibilityService moduleVisibilityService, IOptions<SidebarVisibilityOptions> visibilityOptions)
    {
        _moduleVisibilityService = moduleVisibilityService;
        _visibilityOptions = visibilityOptions;
    }

    [HttpGet("sidebar-modules")]
    public async Task<ActionResult<IReadOnlyList<ModuleDto>>> GetSidebarModules(CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var isSuperAdmin = bool.TryParse(User.FindFirst("isSuperAdmin")?.Value, out var flag) && flag;
        var denyList = _visibilityOptions.Value.UseDenyListMode;

        var modules = await _moduleVisibilityService.GetVisibleModulesAsync(userId, isSuperAdmin, denyList, cancellationToken);
        return Ok(modules);
    }
}
