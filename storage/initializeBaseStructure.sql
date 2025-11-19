-- SQL Server T-SQL schema for c1extranet (excluding presse & droits dérivés)

GO
USE DATAHUB;
GO

CREATE TABLE [actionHistory] (
  [id] INT IDENTITY(1,1) NOT NULL,
  [date] DATETIME2 DEFAULT NULL,
  [description] NVARCHAR(MAX) DEFAULT NULL,
  [userId] INT DEFAULT NULL,
  [action] NVARCHAR(255) DEFAULT NULL
  ,CONSTRAINT [PK_actionHistory] PRIMARY KEY ([id])
);
CREATE INDEX [IX_actionHistory_actionHistory_ibfk_1] ON [actionHistory] ([userId]);

CREATE TABLE [blockElements] (
  [blockId] INT NOT NULL,
  [elementId] INT NOT NULL
  ,CONSTRAINT [PK_blockElements] PRIMARY KEY ([blockId], [elementId])
);
CREATE INDEX [IX_blockElements_blockElements_ibfk_2] ON [blockElements] ([elementId]);

CREATE TABLE [blocks] (
  [id] INT IDENTITY(1,1) NOT NULL,
  [title] NVARCHAR(255) DEFAULT NULL,
  [content] NVARCHAR(MAX) DEFAULT NULL
  ,CONSTRAINT [PK_blocks] PRIMARY KEY ([id])
);

CREATE TABLE [elements] (
  [elementId] INT IDENTITY(1,1) NOT NULL,
  [elementType] NVARCHAR(255) NOT NULL,
  [elementCode] NVARCHAR(255) NOT NULL,
  [content] NVARCHAR(MAX) DEFAULT NULL,
  [Commentaire] NVARCHAR(MAX) NOT NULL
  ,CONSTRAINT [PK_elements] PRIMARY KEY ([elementId])
);

CREATE TABLE [filesCss] (
  [id] INT IDENTITY(1,1) NOT NULL,
  [name] NVARCHAR(255) NOT NULL,
  [cssUrl] NVARCHAR(255) NOT NULL,
  [isLocal] BIT NOT NULL DEFAULT 0,
  [media] NVARCHAR(50) DEFAULT 'all',
  [integrity] NVARCHAR(255) DEFAULT NULL,
  [crossOrigin] NVARCHAR(50) DEFAULT NULL,
  [location] NVARCHAR(255) NOT NULL DEFAULT 'HEAD'
  ,CONSTRAINT [PK_filesCss] PRIMARY KEY ([id])
);

CREATE TABLE [filesFavicons] (
  [id] INT IDENTITY(1,1) NOT NULL,
  [favicon16x16Url] NVARCHAR(255) DEFAULT NULL,
  [favicon32x32Url] NVARCHAR(255) DEFAULT NULL,
  [favicon64x64Url] NVARCHAR(255) DEFAULT NULL,
  [favicon128x128Url] NVARCHAR(255) DEFAULT NULL,
  [favicon256x256Url] NVARCHAR(255) DEFAULT NULL,
  [favicon192x192Url] NVARCHAR(255) DEFAULT NULL,
  [favicon512x512Url] NVARCHAR(255) DEFAULT NULL,
  [appleTouchIconUrl] NVARCHAR(255) DEFAULT NULL,
  [msTileUrl] NVARCHAR(255) DEFAULT NULL,
  [faviconIcoUrl] NVARCHAR(255) NOT NULL,
  [faviconWebManifestUrl] NVARCHAR(255) NOT NULL
  ,CONSTRAINT [PK_filesFavicons] PRIMARY KEY ([id])
);

CREATE TABLE [filesJavaScript] (
  [id] INT IDENTITY(1,1) NOT NULL,
  [name] NVARCHAR(255) NOT NULL,
  [scriptUrl] NVARCHAR(255) NOT NULL,
  [isLocal] BIT NOT NULL DEFAULT 0,
  [location] NVARCHAR(255) NOT NULL DEFAULT 'HEAD'
  ,CONSTRAINT [PK_filesJavaScript] PRIMARY KEY ([id])
);

CREATE TABLE [frameworkCache] (
  [cacheKey] NVARCHAR(255) NOT NULL,
  [cacheValue] NVARCHAR(MAX) DEFAULT NULL,
  [expirationTime] DATETIME2 DEFAULT NULL
  ,CONSTRAINT [PK_frameworkCache] PRIMARY KEY ([cacheKey])
);

CREATE TABLE [frameworkLogs] (
  [logID] INT IDENTITY(1,1) NOT NULL,
  [timestamp] DATETIME2 DEFAULT NULL,
  [logMessage] NVARCHAR(MAX) DEFAULT NULL
  ,CONSTRAINT [PK_frameworkLogs] PRIMARY KEY ([logID])
);

CREATE TABLE [functionsToCall] (
  [id] INT IDENTITY(1,1) NOT NULL,
  [classe] NVARCHAR(255) NOT NULL,
  [methode] NVARCHAR(255) NOT NULL,
  [parametres] NVARCHAR(MAX)
  ,CONSTRAINT [PK_functionsToCall] PRIMARY KEY ([id])
);

CREATE TABLE [globalSettings] (
  [id] INT IDENTITY(1,1) NOT NULL,
  [settingName] NVARCHAR(255) DEFAULT NULL,
  [settingValue] NVARCHAR(MAX) DEFAULT NULL
  ,CONSTRAINT [PK_globalSettings] PRIMARY KEY ([id])
);

CREATE TABLE [groupPermissions] (
  [permissionId] INT IDENTITY(1,1) NOT NULL,
  [groupId] INT NOT NULL,
  [permissionType] NVARCHAR(255) NOT NULL,
  [zoneId] INT DEFAULT NULL,
  [moduleId] INT DEFAULT NULL,
  [pageId] INT DEFAULT NULL,
  [blockId] INT DEFAULT NULL,
  [elementId] INT DEFAULT NULL,
  [canView] BIT DEFAULT NULL
  ,CONSTRAINT [PK_groupPermissions] PRIMARY KEY ([permissionId])
);
CREATE INDEX [IX_groupPermissions_groupPermissions_ibfk_1] ON [groupPermissions] ([groupId]);
CREATE INDEX [IX_groupPermissions_groupPermissions_ibfk_2] ON [groupPermissions] ([elementId]);

CREATE TABLE [jsTraductions] (
  [id] INT IDENTITY(1,1) NOT NULL,
  [fr] NVARCHAR(MAX) NOT NULL,
  [en] NVARCHAR(MAX) NOT NULL
  ,CONSTRAINT [PK_jsTraductions] PRIMARY KEY ([id])
);

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Primary Key',
    @level0type = N'SCHEMA', @level0name = 'dbo', 
    @level1type = N'TABLE',  @level1name = 'jsTraductions',
    @level2type = N'COLUMN', @level2name = 'id';

CREATE TABLE [labels] (
  [labelId] INT IDENTITY(1,1) NOT NULL,
  [labelIdLink] INT NOT NULL,
  [language] NVARCHAR(50) NOT NULL,
  [content] NVARCHAR(MAX) DEFAULT NULL
  ,CONSTRAINT [PK_labels] PRIMARY KEY ([labelId])
);

CREATE TABLE [logs] (
  [id] INT IDENTITY(1,1) NOT NULL,
  [level] NVARCHAR(50) NOT NULL,
  [message] NVARCHAR(MAX) NOT NULL,
  [timestamp] DATETIME2 NOT NULL,
  [requestId] NVARCHAR(255) NOT NULL,
  [clientInfo] NVARCHAR(255) DEFAULT NULL,
  [additionalInfo] NVARCHAR(MAX)
  ,CONSTRAINT [PK_logs] PRIMARY KEY ([id])
);
CREATE INDEX [IX_logs_timestamp] ON [logs] ([timestamp]);
CREATE INDEX [IX_logs_request_id] ON [logs] ([requestId]);

CREATE TABLE [modules] (
  [id] INT IDENTITY(1,1) NOT NULL,
  [name] NVARCHAR(255) NOT NULL,
  [supportMultilingual] BIT DEFAULT NULL,
  [description] NVARCHAR(MAX) DEFAULT NULL,
  [isActive] BIT DEFAULT NULL,
  [version] NVARCHAR(50) DEFAULT NULL,
  [createdAt] DATETIME2 DEFAULT GETDATE(),
  [updatedAt] DATETIME2 DEFAULT GETDATE()
  ,CONSTRAINT [PK_modules] PRIMARY KEY ([id])
);

CREATE TABLE [modulesPages] (
  [moduleId] INT NOT NULL,
  [pageId] INT NOT NULL,
  [defaultPage] BIT NOT NULL
  ,CONSTRAINT [PK_modulesPages] PRIMARY KEY ([moduleId], [pageId])
);
CREATE INDEX [IX_modulesPages_modulesPages_ibfk_2] ON [modulesPages] ([pageId]);

CREATE TABLE [pages] (
  [id] INT IDENTITY(1,1) NOT NULL,
  [name] NVARCHAR(255) NOT NULL,
  [metaTitle] NVARCHAR(255) NOT NULL,
  [metaDescription] NVARCHAR(MAX) DEFAULT NULL,
  [isPublished] BIT DEFAULT NULL,
  [publishedAt] DATETIME2 DEFAULT NULL,
  [needUserConnected] BIT NOT NULL DEFAULT 1
  ,CONSTRAINT [PK_pages] PRIMARY KEY ([id])
);

CREATE TABLE [pagesBlocks] (
  [pageId] INT NOT NULL,
  [blockId] INT NOT NULL,
  [blocksOrder] INT NOT NULL DEFAULT 1
  ,CONSTRAINT [PK_pagesBlocks] PRIMARY KEY ([pageId], [blockId])
);
CREATE INDEX [IX_pagesBlocks_pagesBlocks_ibfk_2] ON [pagesBlocks] ([blockId]);

CREATE TABLE [pagesCss] (
  [pageId] INT NOT NULL,
  [cssId] INT NOT NULL
  ,CONSTRAINT [PK_pagesCss] PRIMARY KEY ([pageId], [cssId])
);
CREATE INDEX [IX_pagesCss_pagesCss_ibfk_2] ON [pagesCss] ([cssId]);

CREATE TABLE [pagesJavaScript] (
  [pageId] INT NOT NULL,
  [scriptId] INT NOT NULL
  ,CONSTRAINT [PK_pagesJavaScript] PRIMARY KEY ([pageId], [scriptId])
);
CREATE INDEX [IX_pagesJavaScript_ScriptID] ON [pagesJavaScript] ([scriptId]);

CREATE TABLE [projectZones] (
  [idProject] INT NOT NULL,
  [idZone] INT NOT NULL
);
CREATE INDEX [IX_projectZones_Id project] ON [projectZones] ([idProject]);
CREATE INDEX [IX_projectZones_id Zone] ON [projectZones] ([idZone]);

CREATE TABLE [projects] (
  [id] INT IDENTITY(1,1) NOT NULL,
  [code] NVARCHAR(255) NOT NULL,
  [company] NVARCHAR(255) NOT NULL,
  [name] NVARCHAR(255) DEFAULT NULL,
  [version] NVARCHAR(50) DEFAULT NULL,
  [type] NVARCHAR(255) NOT NULL DEFAULT 'WEB',
  [uri] NVARCHAR(255) DEFAULT NULL,
  [memoryLimit] NVARCHAR(255) NOT NULL DEFAULT '512',
  [domain] NVARCHAR(255) NOT NULL DEFAULT 'groupe-glenat.com',
  [domainSub] NVARCHAR(50) NOT NULL,
  [assistance] NVARCHAR(255) NOT NULL DEFAULT 'support.informatique@glenat.com',
  [websiteBrand] NVARCHAR(255) NOT NULL DEFAULT 'www.glenat.com'
  ,CONSTRAINT [PK_projects] PRIMARY KEY ([id])
);

CREATE TABLE [projectsSettings] (
  [parameterId] INT IDENTITY(1,1) NOT NULL,
  [parameterName] NVARCHAR(255) NOT NULL,
  [parameterValue] NVARCHAR(255) NOT NULL,
  [projectId] INT NOT NULL
  ,CONSTRAINT [PK_projectsSettings] PRIMARY KEY ([parameterId])
);
CREATE INDEX [IX_projectsSettings_IK_project] ON [projectsSettings] ([projectId]);

CREATE TABLE [requestLogs] (
  [id] INT IDENTITY(1,1) NOT NULL,
  [requestId] NVARCHAR(255) NOT NULL,
  [method] NVARCHAR(10) NOT NULL,
  [uri] NVARCHAR(MAX) NOT NULL,
  [headers] NVARCHAR(MAX) DEFAULT NULL,
  [body] NVARCHAR(MAX) DEFAULT NULL,
  [createdAt] DATETIME2 NULL DEFAULT GETDATE()
  ,CONSTRAINT [PK_requestLogs] PRIMARY KEY ([id])
);

CREATE TABLE [templates] (
  [id] INT IDENTITY(1,1) NOT NULL,
  [name] NVARCHAR(255) NOT NULL,
  [templateFolder] NVARCHAR(255) NOT NULL
  ,CONSTRAINT [PK_templates] PRIMARY KEY ([id])
);

CREATE TABLE [userGroupMembers] (
  [userId] INT NOT NULL,
  [groupId] INT NOT NULL
  ,CONSTRAINT [PK_userGroupMembers] PRIMARY KEY ([userId], [groupId])
);
CREATE INDEX [IX_userGroupMembers_group_id] ON [userGroupMembers] ([groupId]);

CREATE TABLE [userGroups] (
  [groupId] INT IDENTITY(1,1) NOT NULL,
  [groupName] NVARCHAR(255) DEFAULT NULL
  ,CONSTRAINT [PK_userGroups] PRIMARY KEY ([groupId])
);

CREATE TABLE [userPermissions] (
  [permissionId] INT IDENTITY(1,1) NOT NULL,
  [userId] INT NOT NULL,
  [permissionType] NVARCHAR(255) NOT NULL,
  [zoneId] INT DEFAULT NULL,
  [moduleId] INT DEFAULT NULL,
  [pageId] INT DEFAULT NULL,
  [blockId] INT DEFAULT NULL,
  [elementId] INT DEFAULT NULL,
  [canView] BIT DEFAULT NULL
  ,CONSTRAINT [PK_userPermissions] PRIMARY KEY ([permissionId])
);
CREATE INDEX [IX_userPermissions_userPermissions_ibfk_1] ON [userPermissions] ([userId]);

CREATE TABLE [users] (
  [userId] INT IDENTITY(1,1) NOT NULL,
  [firstName] NVARCHAR(50) NOT NULL,
  [lastName] NVARCHAR(50) DEFAULT NULL,
  [username] NVARCHAR(255) DEFAULT NULL,
  [password] NVARCHAR(255) DEFAULT NULL,
  [email] NVARCHAR(255) DEFAULT NULL,
  [photoSD] NVARCHAR(255) NOT NULL DEFAULT 'defaultUserImage.png',
  [preferedLanguage] NVARCHAR(2) NOT NULL DEFAULT 'fr',
  [preferedTheme] NVARCHAR(255) NOT NULL DEFAULT 'light'
  ,CONSTRAINT [PK_users] PRIMARY KEY ([userId])
);

CREATE TABLE [zones] (
  [id] INT IDENTITY(1,1) NOT NULL,
  [name] NVARCHAR(255) DEFAULT NULL,
  [template] INT NOT NULL,
  [defaultLanguage] NVARCHAR(255) DEFAULT NULL,
  [defaultSiteZone] BIT NOT NULL DEFAULT 0,
  [authorizedLanguages] NVARCHAR(255) NOT NULL,
  [defaultTimeZone] NVARCHAR(255) DEFAULT NULL,
  [cacheControl] NVARCHAR(255) DEFAULT NULL,
  [cachePragma] NVARCHAR(255) DEFAULT 'cache',
  [cacheAge] NVARCHAR(255) DEFAULT 'max-age=3600',
  [faviconId] INT DEFAULT NULL,
  [description] NVARCHAR(MAX) DEFAULT NULL,
  [keywords] NVARCHAR(MAX) DEFAULT NULL,
  [googleBot] NVARCHAR(255) DEFAULT 'index, follow',
  [robots] NVARCHAR(255) DEFAULT 'index, follow',
  [visualTheme] NVARCHAR(255) DEFAULT NULL,
  [defaultViewportSize] NVARCHAR(255) DEFAULT NULL,
  [pageDescription] NVARCHAR(MAX) DEFAULT NULL,
  [optimizePerformance] BIT DEFAULT NULL,
  [performanceSettings] NVARCHAR(MAX) DEFAULT NULL
  ,CONSTRAINT [PK_zones] PRIMARY KEY ([id])
);
CREATE UNIQUE INDEX [UX_zones_Template] ON [zones] ([id]);
CREATE INDEX [IX_zones_FaviconID] ON [zones] ([faviconId]);
CREATE INDEX [IX_zones_zones_ibfk_2] ON [zones] ([template]);

CREATE TABLE [zonesModules] (
  [zoneId] INT NOT NULL,
  [moduleId] INT NOT NULL,
  [defaultModule] BIT NOT NULL
  ,CONSTRAINT [PK_zonesModules] PRIMARY KEY ([zoneId], [moduleId])
);
CREATE INDEX [IX_zonesModules_ModuleID] ON [zonesModules] ([moduleId]);

-- Foreign keys

ALTER TABLE [actionHistory] ADD CONSTRAINT [actionHistory_ibfk_1] FOREIGN KEY ([userId]) REFERENCES [users] ([userId]);

ALTER TABLE [blockElements] ADD CONSTRAINT [blockElements_ibfk_1] FOREIGN KEY ([blockId]) REFERENCES [blocks] ([id]);

ALTER TABLE [blockElements] ADD CONSTRAINT [blockElements_ibfk_2] FOREIGN KEY ([elementId]) REFERENCES [elements] ([elementId]);

ALTER TABLE [groupPermissions] ADD CONSTRAINT [groupPermissions_ibfk_1] FOREIGN KEY ([groupId]) REFERENCES [userGroups] ([groupId]);

ALTER TABLE [groupPermissions] ADD CONSTRAINT [groupPermissions_ibfk_2] FOREIGN KEY ([elementId]) REFERENCES [elements] ([elementId]);

ALTER TABLE [modulesPages] ADD CONSTRAINT [modulesPages_ibfk_1] FOREIGN KEY ([moduleId]) REFERENCES [modules] ([id]);

ALTER TABLE [modulesPages] ADD CONSTRAINT [modulesPages_ibfk_2] FOREIGN KEY ([pageId]) REFERENCES [pages] ([id]);

ALTER TABLE [pagesBlocks] ADD CONSTRAINT [pagesBlocks_ibfk_1] FOREIGN KEY ([pageId]) REFERENCES [pages] ([id]);

ALTER TABLE [pagesBlocks] ADD CONSTRAINT [pagesBlocks_ibfk_2] FOREIGN KEY ([blockId]) REFERENCES [blocks] ([id]);

ALTER TABLE [pagesCss] ADD CONSTRAINT [pagesCss_ibfk_1] FOREIGN KEY ([pageId]) REFERENCES [pages] ([id]);

ALTER TABLE [pagesCss] ADD CONSTRAINT [pagesCss_ibfk_2] FOREIGN KEY ([cssId]) REFERENCES [filesCss] ([id]);

ALTER TABLE [pagesJavaScript] ADD CONSTRAINT [pagesJavaScript_ibfk_1] FOREIGN KEY ([pageId]) REFERENCES [pages] ([id]);

ALTER TABLE [pagesJavaScript] ADD CONSTRAINT [pagesJavaScript_ibfk_2] FOREIGN KEY ([scriptId]) REFERENCES [filesJavaScript] ([id]);

-- projectZones.idProject → projects.id
ALTER TABLE [projectZones] WITH CHECK
ADD CONSTRAINT [FK_projectZones_projects]
    FOREIGN KEY ([idProject]) REFERENCES [projects]([id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- projectZones.idZone → zones.id
ALTER TABLE [projectZones] WITH CHECK
ADD CONSTRAINT [FK_projectZones_zones]
    FOREIGN KEY ([idZone]) REFERENCES [zones]([id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

ALTER TABLE [projectsSettings] ADD CONSTRAINT [IK_project] FOREIGN KEY ([projectId]) REFERENCES [projects] ([id]);

ALTER TABLE [userGroupMembers] ADD CONSTRAINT [userGroupMembers_ibfk_1] FOREIGN KEY ([userId]) REFERENCES [users] ([userId]);

ALTER TABLE [userGroupMembers] ADD CONSTRAINT [userGroupMembers_ibfk_2] FOREIGN KEY ([groupId]) REFERENCES [userGroups] ([groupId]);

ALTER TABLE [userPermissions] ADD CONSTRAINT [userPermissions_ibfk_1] FOREIGN KEY ([userId]) REFERENCES [users] ([userId]);

ALTER TABLE [zones] ADD CONSTRAINT [zones_ibfk_1] FOREIGN KEY ([faviconId]) REFERENCES [filesFavicons] ([id]);

ALTER TABLE [zones] ADD CONSTRAINT [zones_ibfk_2] FOREIGN KEY ([template]) REFERENCES [templates] ([id]);

ALTER TABLE [zonesModules] ADD CONSTRAINT [zonesModules_ibfk_1] FOREIGN KEY ([zoneId]) REFERENCES [zones] ([id]);

ALTER TABLE [zonesModules] ADD CONSTRAINT [zonesModules_ibfk_2] FOREIGN KEY ([moduleId]) REFERENCES [modules] ([id]);
