using System;
using Intranet.Api.Data;
using Intranet.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace Intranet.Api.Migrations
{
    [DbContext(typeof(IntranetDbContext))]
    partial class IntranetDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.0")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.HasDefaultSchema("dbo");

            modelBuilder.Entity("Intranet.Api.Entities.Module", b =>
                {
                    b.Property<int>("Id")
                        .HasColumnType("int")
                        .HasColumnName("id");

                    b.Property<string>("Icon")
                        .HasMaxLength(50)
                        .HasColumnType("nvarchar(50)")
                        .HasColumnName("icon");

                    b.Property<bool>("IsActive")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bit")
                        .HasDefaultValue(true)
                        .HasColumnName("isActive");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)")
                        .HasColumnName("name");

                    b.Property<int?>("Order")
                        .HasColumnType("int")
                        .HasColumnName("order");

                    b.Property<string>("Path")
                        .IsRequired()
                        .HasMaxLength(200)
                        .HasColumnType("nvarchar(200)")
                        .HasColumnName("path");

                    b.Property<string>("Section")
                        .HasMaxLength(50)
                        .HasColumnType("nvarchar(50)")
                        .HasColumnName("section");

                    b.HasKey("Id")
                        .HasName("PK_modules");

                    b.HasIndex("IsActive", "Order")
                        .HasDatabaseName("IX_modules_isActive_order");

                    b.ToTable("modules", "dbo");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            Icon = "home",
                            IsActive = true,
                            Name = "Accueil",
                            Order = 1,
                            Path = "/",
                            Section = "general"
                        },
                        new
                        {
                            Id = 2,
                            Icon = "book",
                            IsActive = true,
                            Name = "Catalogue",
                            Order = 2,
                            Path = "/catalogue",
                            Section = "general"
                        },
                        new
                        {
                            Id = 3,
                            Icon = "calendar",
                            IsActive = true,
                            Name = "Agenda",
                            Order = 3,
                            Path = "/agenda",
                            Section = "general"
                        },
                        new
                        {
                            Id = 4,
                            Icon = "briefcase",
                            IsActive = true,
                            Name = "Services",
                            Order = 4,
                            Path = "/services",
                            Section = "general"
                        },
                        new
                        {
                            Id = 5,
                            Icon = "settings",
                            IsActive = true,
                            Name = "Administration",
                            Order = 99,
                            Path = "/administration",
                            Section = "administration"
                        });
                });

            modelBuilder.Entity("Intranet.Api.Entities.User", b =>
                {
                    b.Property<int>("Id")
                        .HasColumnType("int")
                        .HasColumnName("id");

                    b.Property<string>("DisplayName")
                        .HasMaxLength(150)
                        .HasColumnType("nvarchar(150)")
                        .HasColumnName("displayName");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("nvarchar(255)")
                        .HasColumnName("email");

                    b.Property<bool>("IsSuperAdmin")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bit")
                        .HasDefaultValue(false)
                        .HasColumnName("isSuperAdmin");

                    b.Property<byte[]>("PasswordHash")
                        .HasColumnType("varbinary(max)")
                        .HasColumnName("passwordHash");

                    b.HasKey("Id")
                        .HasName("PK_users");

                    b.HasIndex("Email")
                        .IsUnique()
                        .HasDatabaseName("IX_users_email");

                    b.ToTable("users", "dbo");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            DisplayName = "Super Admin",
                            Email = "admin@example.com",
                            IsSuperAdmin = true,
                            PasswordHash = new byte[] { 102, 97, 107, 101, 45, 104, 97, 115, 104, 45, 97, 100, 109, 105, 110 }
                        },
                        new
                        {
                            Id = 2,
                            DisplayName = "Marie Dupont",
                            Email = "marie.dupont@example.com",
                            IsSuperAdmin = false,
                            PasswordHash = new byte[] { 102, 97, 107, 101, 45, 104, 97, 115, 104, 45, 109, 97, 114, 105, 101 }
                        },
                        new
                        {
                            Id = 3,
                            DisplayName = "Paul Martin",
                            Email = "paul.martin@example.com",
                            IsSuperAdmin = false,
                            PasswordHash = new byte[] { 102, 97, 107, 101, 45, 104, 97, 115, 104, 45, 112, 97, 117, 108 }
                        });
                });

            modelBuilder.Entity("Intranet.Api.Entities.UserPermission", b =>
                {
                    b.Property<int>("PermissionId")
                        .HasColumnType("int")
                        .HasColumnName("permissionId");

                    b.Property<bool>("CanView")
                        .HasColumnType("bit")
                        .HasColumnName("canView");

                    b.Property<int>("ModuleId")
                        .HasColumnType("int")
                        .HasColumnName("moduleId");

                    b.Property<int>("UserId")
                        .HasColumnType("int")
                        .HasColumnName("userId");

                    b.HasKey("PermissionId")
                        .HasName("PK_userPermissions");

                    b.HasIndex("ModuleId")
                        .HasDatabaseName("IX_userPermissions_moduleId");

                    b.HasIndex("UserId")
                        .HasDatabaseName("IX_userPermissions_userId");

                    b.HasIndex("UserId", "ModuleId")
                        .IsUnique()
                        .HasDatabaseName("UX_UserModule");

                    b.ToTable("userPermissions", "dbo");

                    b.HasData(
                        new
                        {
                            PermissionId = 1,
                            CanView = false,
                            ModuleId = 5,
                            UserId = 2
                        },
                        new
                        {
                            PermissionId = 2,
                            CanView = false,
                            ModuleId = 4,
                            UserId = 2
                        },
                        new
                        {
                            PermissionId = 3,
                            CanView = true,
                            ModuleId = 2,
                            UserId = 3
                        },
                        new
                        {
                            PermissionId = 4,
                            CanView = true,
                            ModuleId = 3,
                            UserId = 3
                        },
                        new
                        {
                            PermissionId = 5,
                            CanView = true,
                            ModuleId = 5,
                            UserId = 3
                        });

                    b.HasOne("Intranet.Api.Entities.Module", "Module")
                        .WithMany("UserPermissions")
                        .HasForeignKey("ModuleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Intranet.Api.Entities.User", "User")
                        .WithMany("Permissions")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Module");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Intranet.Api.Entities.Module", b =>
                {
                    b.Navigation("UserPermissions");
                });

            modelBuilder.Entity("Intranet.Api.Entities.User", b =>
                {
                    b.Navigation("Permissions");
                });
#pragma warning restore 612, 618
        }
    }
}
