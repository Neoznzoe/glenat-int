using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Intranet.Api.Entities;

/// <summary>
/// Represents an intranet user.
/// </summary>
[Table("users", Schema = "dbo")]
public class User
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("email")]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Column("displayName")]
    [MaxLength(150)]
    public string? DisplayName { get; set; }

    [Column("isSuperAdmin")]
    public bool IsSuperAdmin { get; set; }

    [Column("passwordHash")]
    public byte[]? PasswordHash { get; set; }

    public ICollection<UserPermission> Permissions { get; set; } = new HashSet<UserPermission>();
}
