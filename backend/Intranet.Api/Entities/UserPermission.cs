using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Intranet.Api.Entities;

/// <summary>
/// Represents a user specific permission for a module.
/// </summary>
[Table("userPermissions", Schema = "dbo")]
public class UserPermission
{
    [Key]
    [Column("permissionId")]
    public int PermissionId { get; set; }

    [Column("userId")]
    public int UserId { get; set; }

    [Column("moduleId")]
    public int ModuleId { get; set; }

    [Column("canView")]
    public bool CanView { get; set; }

    public User? User { get; set; }
    public Module? Module { get; set; }
}
