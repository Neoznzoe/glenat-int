using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Intranet.Api.Entities;

/// <summary>
/// Represents a functional module displayed in the sidebar.
/// </summary>
[Table("modules", Schema = "dbo")]
public class Module
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("name")]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Column("path")]
    [MaxLength(200)]
    public string Path { get; set; } = string.Empty;

    [Column("icon")]
    [MaxLength(50)]
    public string? Icon { get; set; }

    [Column("order")]
    public int? Order { get; set; }

    [Column("section")]
    [MaxLength(50)]
    public string? Section { get; set; }

    [Column("isActive")]
    public bool IsActive { get; set; } = true;

    public ICollection<UserPermission> UserPermissions { get; set; } = new HashSet<UserPermission>();
}
