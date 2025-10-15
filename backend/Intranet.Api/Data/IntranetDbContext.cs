using System.Text;
using Intranet.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Intranet.Api.Data;

public class IntranetDbContext : DbContext
{
    public IntranetDbContext(DbContextOptions<IntranetDbContext> options) : base(options)
    {
    }

    public DbSet<Module> Modules => Set<Module>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserPermission> UserPermissions => Set<UserPermission>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Module>(entity =>
        {
            entity.HasKey(m => m.Id);
            entity.Property(m => m.Name).IsRequired().HasMaxLength(100);
            entity.Property(m => m.Path).IsRequired().HasMaxLength(200);
            entity.HasIndex(m => new { m.IsActive, m.Order });

            entity.HasData(
                new Module { Id = 1, Name = "Accueil", Path = "/", Icon = "home", Order = 1, Section = "general", IsActive = true },
                new Module { Id = 2, Name = "Catalogue", Path = "/catalogue", Icon = "book", Order = 2, Section = "general", IsActive = true },
                new Module { Id = 3, Name = "Agenda", Path = "/agenda", Icon = "calendar", Order = 3, Section = "general", IsActive = true },
                new Module { Id = 4, Name = "Services", Path = "/services", Icon = "briefcase", Order = 4, Section = "general", IsActive = true },
                new Module { Id = 5, Name = "Administration", Path = "/administration", Icon = "settings", Order = 99, Section = "administration", IsActive = true }
            );
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(255);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.DisplayName).HasMaxLength(150);

            entity.HasData(
                new User
                {
                    Id = 1,
                    Email = "admin@example.com",
                    DisplayName = "Super Admin",
                    IsSuperAdmin = true,
                    PasswordHash = Encoding.UTF8.GetBytes("fake-hash-admin")
                },
                new User
                {
                    Id = 2,
                    Email = "marie.dupont@example.com",
                    DisplayName = "Marie Dupont",
                    IsSuperAdmin = false,
                    PasswordHash = Encoding.UTF8.GetBytes("fake-hash-marie")
                },
                new User
                {
                    Id = 3,
                    Email = "paul.martin@example.com",
                    DisplayName = "Paul Martin",
                    IsSuperAdmin = false,
                    PasswordHash = Encoding.UTF8.GetBytes("fake-hash-paul")
                }
            );
        });

        modelBuilder.Entity<UserPermission>(entity =>
        {
            entity.HasKey(p => p.PermissionId);
            entity.HasIndex(p => new { p.UserId, p.ModuleId }).IsUnique().HasDatabaseName("UX_UserModule");
            entity.HasIndex(p => p.UserId);
            entity.Property(p => p.CanView).IsRequired();

            entity.HasOne(p => p.User)
                .WithMany(u => u.Permissions)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(p => p.Module)
                .WithMany(m => m.UserPermissions)
                .HasForeignKey(p => p.ModuleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasData(
                new UserPermission { PermissionId = 1, UserId = 2, ModuleId = 5, CanView = false },
                new UserPermission { PermissionId = 2, UserId = 2, ModuleId = 4, CanView = false },
                new UserPermission { PermissionId = 3, UserId = 3, ModuleId = 2, CanView = true },
                new UserPermission { PermissionId = 4, UserId = 3, ModuleId = 3, CanView = true },
                new UserPermission { PermissionId = 5, UserId = 3, ModuleId = 5, CanView = true }
            );
        });
    }
}
