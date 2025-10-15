namespace Intranet.Api.Services;

/// <summary>
/// Configures the default visibility strategy for the sidebar.
/// </summary>
public class SidebarVisibilityOptions
{
    /// <summary>
    /// True = deny-list mode (default). False = allow-list mode.
    /// </summary>
    public bool UseDenyListMode { get; set; } = true;
}
