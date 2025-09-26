ALTER TABLE [actionHistory] DROP CONSTRAINT [actionHistory_ibfk_1];

ALTER TABLE [blockElements] DROP CONSTRAINT [blockElements_ibfk_1];
ALTER TABLE [blockElements] DROP CONSTRAINT [blockElements_ibfk_2];

ALTER TABLE [groupPermissions] DROP CONSTRAINT [groupPermissions_ibfk_1];
ALTER TABLE [groupPermissions] DROP CONSTRAINT [groupPermissions_ibfk_2];

ALTER TABLE [modulesPages] DROP CONSTRAINT [modulesPages_ibfk_1];
ALTER TABLE [modulesPages] DROP CONSTRAINT [modulesPages_ibfk_2];

ALTER TABLE [pagesBlocks] DROP CONSTRAINT [pagesBlocks_ibfk_1];
ALTER TABLE [pagesBlocks] DROP CONSTRAINT [pagesBlocks_ibfk_2];

ALTER TABLE [pagesCss] DROP CONSTRAINT [pagesCss_ibfk_1];
ALTER TABLE [pagesCss] DROP CONSTRAINT [pagesCss_ibfk_2];

ALTER TABLE [pagesJavaScript] DROP CONSTRAINT [pagesJavaScript_ibfk_1];
ALTER TABLE [pagesJavaScript] DROP CONSTRAINT [pagesJavaScript_ibfk_2];

ALTER TABLE [projectZones] DROP CONSTRAINT [FK_projectZones_projects];
ALTER TABLE [projectZones] DROP CONSTRAINT [FK_projectZones_zones];

ALTER TABLE [projectsSettings] DROP CONSTRAINT [IK_project];

ALTER TABLE [userGroupMembers] DROP CONSTRAINT [userGroupMembers_ibfk_1];
ALTER TABLE [userGroupMembers] DROP CONSTRAINT [userGroupMembers_ibfk_2];

ALTER TABLE [userPermissions] DROP CONSTRAINT [userPermissions_ibfk_1];

ALTER TABLE [zones] DROP CONSTRAINT [zones_ibfk_1];
ALTER TABLE [zones] DROP CONSTRAINT [zones_ibfk_2];

ALTER TABLE [zonesModules] DROP CONSTRAINT [zonesModules_ibfk_1];
ALTER TABLE [zonesModules] DROP CONSTRAINT [zonesModules_ibfk_2];

-- ==========================
-- Suppression des TABLES
-- ==========================
DROP TABLE [zonesModules];
DROP TABLE [zones];
DROP TABLE [users];
DROP TABLE [userPermissions];
DROP TABLE [userGroups];
DROP TABLE [userGroupMembers];
DROP TABLE [templates];
DROP TABLE [requestLogs];
DROP TABLE [projectsSettings];
DROP TABLE [projects];
DROP TABLE [projectZones];
DROP TABLE [pagesJavaScript];
DROP TABLE [pagesCss];
DROP TABLE [pagesBlocks];
DROP TABLE [pages];
DROP TABLE [modulesPages];
DROP TABLE [modules];
DROP TABLE [logs];
DROP TABLE [labels];
DROP TABLE [jsTraductions];
DROP TABLE [groupPermissions];
DROP TABLE [globalSettings];
DROP TABLE [functionsToCall];
DROP TABLE [frameworkLogs];
DROP TABLE [frameworkCache];
DROP TABLE [filesJavaScript];
DROP TABLE [filesFavicons];
DROP TABLE [filesCss];
DROP TABLE [elements];
DROP TABLE [blocks];
DROP TABLE [blockElements];
DROP TABLE [actionHistory];