USE DATAHUB;
-- Pas de GO pour conserver la portée des variables

-----------------------------
-- 0) Variables
-----------------------------
DECLARE @projectId       INT;
DECLARE @templateId      INT;
DECLARE @favPublicId     INT, @favAdminId INT, @favDebugId INT;
DECLARE @zonePublicId    INT, @zoneAdminId INT, @zoneDebugId INT;

-----------------------------
-- 1) Insert PROJECT
-----------------------------
INSERT INTO dbo.projects
    (code, company, name, version, type, uri, memoryLimit, domain, domainSub, assistance, websiteBrand)
VALUES
    ('INT', 'GROUPE GLENAT', 'Intranet glénat', '1.0.0', 'WEB',
     'https://intranet.groupe-glenat.com/', '512', 'groupe-glenat.com',
     'intranet./', 'support.informatique@glenat.com', 'www.glenat.com');

-- Récupère l'ID du projet inséré
SET @projectId = SCOPE_IDENTITY();

-----------------------------
-- 2) Insert FAVICONS
-----------------------------
INSERT INTO [filesFavicons] (
    [favicon16x16Url], [favicon32x32Url], [favicon64x64Url], [favicon128x128Url],
    [favicon256x256Url], [favicon192x192Url], [favicon512x512Url],
    [appleTouchIconUrl], [msTileUrl], [faviconIcoUrl], [faviconWebManifestUrl]
) VALUES
('/public/assets/images/falcon/icons/public/favicon-16x16.png',
 '/public/assets/images/falcon/icons/public/favicon-32x32.png',
 NULL,
 NULL,
 '/public/assets/images/falcon/icons/public/favicon-256x256.png',
 '/public/assets/images/falcon/icons/public/android-chrome-192x192.png',
 '/public/assets/images/falcon/icons/public/android-chrome-512x512.png',
 '/public/assets/images/falcon/icons/public/apple-touch-icon.png',
 '/public/assets/images/falcon/icons/public/mstile-150x150.png',
 '/public/assets/images/falcon/icons/public/favicon.ico',
 '/public/assets/images/falcon/icons/public/site.webmanifest'),

('/public/assets/images/icons/admin/favicon-16x16.png',
 '/public/assets/images/icons/admin/favicon-32x32.png',
 '/public/assets/images/icons/admin/favicon-64x64.png',
 '/public/assets/images/icons/admin/favicon-128x128.png',
 '/public/assets/images/icons/admin/favicon-256x256.png',
 '/public/assets/images/icons/admin/android-chrome-192x192.png',
 '/public/assets/images/icons/admin/android-chrome-512x512.png',
 '/public/assets/images/icons/admin/apple-touch-icon.png',
 '/public/assets/images/icons/admin/mstile-150x150.png',
 '/public/assets/images/icons/admin/favicon.ico',
 '/public/assets/images/icons/admin/site.webmanifest'),

('/public/assets/images/icons/debug/favicon-16x16.png',
 '/public/assets/images/icons/debug/favicon-32x32.png',
 '/public/assets/images/icons/debug/favicon-64x64.png',
 '/public/assets/images/icons/debug/favicon-128x128.png',
 '/public/assets/images/icons/debug/favicon-256x256.png',
 '/public/assets/images/icons/debug/android-chrome-192x192.png',
 '/public/assets/images/icons/debug/android-chrome-512x512.png',
 '/public/assets/images/icons/debug/apple-touch-icon.png',
 '/public/assets/images/icons/debug/mstile-150x150.png',
 '/public/assets/images/icons/debug/favicon.ico',
 '/public/assets/images/icons/debug/site.webmanifest');

-- Récupère les IDs des favicons insérés (basé sur le chemin)
SELECT @favPublicId = id
FROM   dbo.filesFavicons
WHERE  faviconIcoUrl = '/public/assets/images/falcon/icons/public/favicon.ico';

SELECT @favAdminId = id
FROM   dbo.filesFavicons
WHERE  faviconIcoUrl = '/public/assets/images/icons/admin/favicon.ico';

SELECT @favDebugId = id
FROM   dbo.filesFavicons
WHERE  faviconIcoUrl = '/public/assets/images/icons/debug/favicon.ico';

-----------------------------
-- 3) Insert TEMPLATE
-----------------------------
INSERT INTO dbo.templates (name, templateFolder)
VALUES ('Falcon','falcon');

-- Récupère l'ID du template inséré
SET @templateId = SCOPE_IDENTITY();

-----------------------------
-- 4) Insert ZONES (en liant templateId & faviconId dynamiquement)
-----------------------------
INSERT INTO dbo.zones (
    name, template, defaultLanguage, defaultSiteZone, authorizedLanguages,
    defaultTimeZone, cacheControl, cachePragma, cacheAge, faviconId,
    description, keywords, googleBot, robots, visualTheme,
    defaultViewportSize, pageDescription, optimizePerformance, performanceSettings
)
VALUES
('public', @templateId, 'en', 1, 'fr,en', 'Europe/Paris',
 'public, max-age=3600', 'cache', 'max-age=3600', @favPublicId,
 'Zone publique accessible à tous les visiteurs', 'site, public, internet',
 'index, follow', 'index, follow', 'default',
 'width=100%, initial-scale=1.0', 'Bienvenue sur notre site public !', 1, 'optimized'),

('admin', @templateId, 'fr', 0, 'fr,en', 'Europe/Paris',
 'no-cache', 'cache', 'max-age=3600', @favAdminId,
 'Zone d''administration réservée aux administrateurs du site', 'admin, gestion, backoffice',
 'index, follow', 'index, follow', 'admin',
 'width=device-width, initial-scale=1.0', 'Bienvenue dans l''interface d''administration !', 0, 'standard'),

('debug', @templateId, 'en', 0, 'fr,en', 'UTC',
 'no-cache', 'cache', 'max-age=3600', @favDebugId,
 'Zone de débogage réservée aux développeurs', 'debug, dev, debugging',
 'index, follow', 'index, follow', 'debug',
 'width=device-width, initial-scale=1.0', 'Bienvenue dans la zone de débogage !', 0, 'debugging');

-- Récupère les IDs des zones insérées
SELECT @zonePublicId = id FROM dbo.zones WHERE name = 'public';
SELECT @zoneAdminId  = id FROM dbo.zones WHERE name = 'admin';
SELECT @zoneDebugId  = id FROM dbo.zones WHERE name = 'debug';

-----------------------------
-- 5) Insert USERS (inchangé)
-----------------------------
INSERT INTO dbo.users (firstName, lastName, username, password, email, photoSD, preferedLanguage, preferedTheme) VALUES
('Nicolas',  'MERCEUR',  'nicolas',   NULL, 'nicolas.merceur@glenat.com',   'defaultUserImage.png', 'fr', 'light'),
('Stéphane', 'CHERMETTE','stéphane',  NULL, 'stephane.chermette@glenat.com','defaultUserImage.png', 'fr', 'light'),
('Matthieu', 'NICOLAS',  'Matthieu',  NULL, 'matthieu.nicolas@glenat.com',  'defaultUserImage.png', 'fr', 'light'),
('Valentin', 'COGAN',    'Valentin',  NULL, 'valentin.cogan@glenat.com',    'defaultUserImage.png', 'fr', 'light'),
('Damien',   'BONIS',    'Damien',    NULL, 'damien.bonis@glenat.com',      'defaultUserImage.png', 'fr', 'light'),
('Victor',   'BESSON',   'victor',    NULL, 'victor.besson@glenat.com',     'defaultUserImage.png', 'fr', 'light');

-----------------------------
-- 6) Insert PROJECT-ZONES (dynamiquement)
-----------------------------
INSERT INTO dbo.projectZones (idProject, idZone)
VALUES
(@projectId, @zonePublicId),
(@projectId, @zoneAdminId),
(@projectId, @zoneDebugId);
