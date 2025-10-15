namespace Intranet.Api.DTOs;

/// <summary>
/// Lightweight module representation exposed through the API.
/// </summary>
public sealed record ModuleDto
(
    int Id,
    string Name,
    string Path,
    string? Icon,
    int? Order,
    string? Section
);
