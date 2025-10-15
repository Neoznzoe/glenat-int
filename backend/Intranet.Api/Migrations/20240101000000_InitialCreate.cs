using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Intranet.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "dbo");

            migrationBuilder.CreateTable(
                name: "modules",
                schema: "dbo",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    path = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    icon = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    order = table.Column<int>(type: "int", nullable: true),
                    section = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    isActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_modules", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                schema: "dbo",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    displayName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    isSuperAdmin = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    passwordHash = table.Column<byte[]>(type: "varbinary(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "userPermissions",
                schema: "dbo",
                columns: table => new
                {
                    permissionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    userId = table.Column<int>(type: "int", nullable: false),
                    moduleId = table.Column<int>(type: "int", nullable: false),
                    canView = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_userPermissions", x => x.permissionId);
                    table.ForeignKey(
                        name: "FK_userPermissions_modules_moduleId",
                        column: x => x.moduleId,
                        principalSchema: "dbo",
                        principalTable: "modules",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_userPermissions_users_userId",
                        column: x => x.userId,
                        principalSchema: "dbo",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_modules_isActive_order",
                schema: "dbo",
                table: "modules",
                columns: new[] { "isActive", "order" });

            migrationBuilder.CreateIndex(
                name: "IX_users_email",
                schema: "dbo",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_userPermissions_moduleId",
                schema: "dbo",
                table: "userPermissions",
                column: "moduleId");

            migrationBuilder.CreateIndex(
                name: "IX_userPermissions_userId",
                schema: "dbo",
                table: "userPermissions",
                column: "userId");

            migrationBuilder.CreateIndex(
                name: "UX_UserModule",
                schema: "dbo",
                table: "userPermissions",
                columns: new[] { "userId", "moduleId" },
                unique: true);

            migrationBuilder.InsertData(
                schema: "dbo",
                table: "modules",
                columns: new[] { "id", "icon", "isActive", "name", "order", "path", "section" },
                values: new object[,]
                {
                    { 1, "home", true, "Accueil", 1, "/", "general" },
                    { 2, "book", true, "Catalogue", 2, "/catalogue", "general" },
                    { 3, "calendar", true, "Agenda", 3, "/agenda", "general" },
                    { 4, "briefcase", true, "Services", 4, "/services", "general" },
                    { 5, "settings", true, "Administration", 99, "/administration", "administration" }
                });

            migrationBuilder.InsertData(
                schema: "dbo",
                table: "users",
                columns: new[] { "id", "displayName", "email", "isSuperAdmin", "passwordHash" },
                values: new object[,]
                {
                    { 1, "Super Admin", "admin@example.com", true, new byte[] { 102, 97, 107, 101, 45, 104, 97, 115, 104, 45, 97, 100, 109, 105, 110 } },
                    { 2, "Marie Dupont", "marie.dupont@example.com", false, new byte[] { 102, 97, 107, 101, 45, 104, 97, 115, 104, 45, 109, 97, 114, 105, 101 } },
                    { 3, "Paul Martin", "paul.martin@example.com", false, new byte[] { 102, 97, 107, 101, 45, 104, 97, 115, 104, 45, 112, 97, 117, 108 } }
                });

            migrationBuilder.InsertData(
                schema: "dbo",
                table: "userPermissions",
                columns: new[] { "permissionId", "canView", "moduleId", "userId" },
                values: new object[,]
                {
                    { 1, false, 5, 2 },
                    { 2, false, 4, 2 },
                    { 3, true, 2, 3 },
                    { 4, true, 3, 3 },
                    { 5, true, 5, 3 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "userPermissions",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "modules",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "users",
                schema: "dbo");
        }
    }
}
