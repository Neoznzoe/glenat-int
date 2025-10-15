using System.Linq;
using System.Security.Claims;
using Intranet.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Intranet.Api.Auth;

/// <summary>
/// Lightweight middleware used for local development. Replace with a real authentication mechanism in production.
/// </summary>
public class FakeAuthMiddleware
{
    private readonly RequestDelegate _next;

    public FakeAuthMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IntranetDbContext dbContext)
    {
        if (context.User?.Identity?.IsAuthenticated == true)
        {
            await _next(context);
            return;
        }

        var userIdHeader = context.Request.Headers["X-User-Id"].FirstOrDefault();
        int userId = int.TryParse(userIdHeader, out var parsedUserId) ? parsedUserId : 2; // default demo user

        var user = await dbContext.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
        {
            user = await dbContext.Users.AsNoTracking().FirstAsync();
            userId = user.Id;
        }

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new("isSuperAdmin", user.IsSuperAdmin.ToString().ToLowerInvariant()),
            new(ClaimTypes.Email, user.Email)
        };

        if (!string.IsNullOrWhiteSpace(user.DisplayName))
        {
            claims.Add(new(ClaimTypes.Name, user.DisplayName!));
        }

        var identity = new ClaimsIdentity(claims, "FakeAuth");
        context.User = new ClaimsPrincipal(identity);

        await _next(context);
    }
}
