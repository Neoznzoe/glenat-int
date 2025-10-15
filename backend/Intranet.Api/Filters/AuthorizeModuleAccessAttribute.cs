using System.Linq;
using System.Security.Claims;
using Intranet.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Options;

namespace Intranet.Api.Filters;

/// <summary>
/// Action filter ensuring that the current user can access the provided module path.
/// Use this filter on feature endpoints belonging to a specific module.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public sealed class AuthorizeModuleAccessAttribute : Attribute, IAsyncActionFilter
{
    private readonly string _modulePath;
    private readonly bool? _denyListOverride;

    public AuthorizeModuleAccessAttribute(string modulePath, bool? denyListOverride = null)
    {
        _modulePath = modulePath;
        _denyListOverride = denyListOverride;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var userIdClaim = context.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdClaim, out var userId))
        {
            context.Result = new ForbidResult();
            return;
        }

        var isSuperAdmin = bool.TryParse(context.HttpContext.User.FindFirst("isSuperAdmin")?.Value, out var flag) && flag;
        if (isSuperAdmin)
        {
            await next();
            return;
        }

        var visibilityService = context.HttpContext.RequestServices.GetRequiredService<IModuleVisibilityService>();
        var options = context.HttpContext.RequestServices.GetService<IOptions<SidebarVisibilityOptions>>();
        var denyList = _denyListOverride ?? options?.Value.UseDenyListMode ?? true;

        var modules = await visibilityService.GetVisibleModulesAsync(userId, isSuperAdmin, denyList, context.HttpContext.RequestAborted);
        var hasAccess = modules.Any(m => string.Equals(m.Path, _modulePath, StringComparison.OrdinalIgnoreCase));

        if (!hasAccess)
        {
            context.Result = new ForbidResult();
            return;
        }

        await next();
    }
}
