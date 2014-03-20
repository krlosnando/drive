-- MEIL Security

USE [master]
GO
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = N'LAC\frosvcmeildv01')
BEGIN
	CREATE LOGIN [LAC\frosvcmeildv01] FROM WINDOWS WITH DEFAULT_DATABASE=[master]
END
GO

EXEC master..sp_addsrvrolemember @loginame = N'LAC\frosvcmeildv01', @rolename = N'bulkadmin'
GO

EXEC master..sp_addsrvrolemember @loginame = N'LAC\frosvcmeildv01', @rolename = N'diskadmin'
GO

EXEC master..sp_addsrvrolemember @loginame = N'LAC\frosvcmeildv01', @rolename = N'serveradmin'
GO

EXEC master..sp_addsrvrolemember @loginame = N'LAC\frosvcmeildv01', @rolename = N'sysadmin'
GO

USE [Automation]
GO

IF NOT EXISTS (SELECT * FROM Automation.dbo.sysusers WHERE name = N'LAC\frosvcmeildv01')
BEGIN
	CREATE USER [LAC\frosvcmeildv01] FOR LOGIN [LAC\frosvcmeildv01] WITH DEFAULT_SCHEMA=[dbo]
END
GO

USE [Automation]
GO

EXEC sp_addrolemember N'db_owner', N'LAC\frosvcmeildv01'
GO

USE [CAM]
GO

IF NOT EXISTS (SELECT * FROM CAM.dbo.sysusers WHERE name = N'LAC\frosvcmeildv01')
BEGIN
	CREATE USER [LAC\frosvcmeildv01] FOR LOGIN [LAC\frosvcmeildv01] WITH DEFAULT_SCHEMA=[dbo]
END
GO

USE [CAM]
GO

EXEC sp_addrolemember N'db_owner', N'LAC\frosvcmeildv01'
GO

USE [MEILDB]
GO

IF NOT EXISTS (SELECT * FROM MEILDB.dbo.sysusers WHERE name = N'LAC\frosvcmeildv01')
BEGIN
	CREATE USER [LAC\frosvcmeildv01] FOR LOGIN [LAC\frosvcmeildv01] WITH DEFAULT_SCHEMA=[dbo]
END
GO

USE [MEILDB]
GO

EXEC sp_addrolemember N'db_owner', N'LAC\frosvcmeildv01'
GO


-- EERS Logins Security

USE [master]
GO

IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = N'EUR\ldnctisvcwapsdv01')
BEGIN
	CREATE LOGIN [EUR\ldnctisvcwapsdv01] FROM WINDOWS WITH DEFAULT_DATABASE=[master], DEFAULT_LANGUAGE=[us_english]
END
GO

IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = N'EUR\ldnctisvcwapsdv02')
BEGIN
	CREATE LOGIN [EUR\ldnctisvcwapsdv02] FROM WINDOWS WITH DEFAULT_DATABASE=[master], DEFAULT_LANGUAGE=[us_english]
END
GO

IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = N'EUR\ldnctisvcwapspr01')
BEGIN
	CREATE LOGIN [EUR\ldnctisvcwapspr01] FROM WINDOWS WITH DEFAULT_DATABASE=[master], DEFAULT_LANGUAGE=[us_english]
END
GO

IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = N'EUR\ldnctisvcwapspr02')
BEGIN
	CREATE LOGIN [EUR\ldnctisvcwapspr02] FROM WINDOWS WITH DEFAULT_DATABASE=[master], DEFAULT_LANGUAGE=[us_english]
END
GO

IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = N'EUR\ldnctisvcwapsua01')
BEGIN
CREATE LOGIN [EUR\ldnctisvcwapsua01] FROM WINDOWS WITH DEFAULT_DATABASE=[master], DEFAULT_LANGUAGE=[us_english]
END
GO

IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = N'EUR\ldnctisvcwapsua02')
BEGIN
	CREATE LOGIN [EUR\ldnctisvcwapsua02] FROM WINDOWS WITH DEFAULT_DATABASE=[master], DEFAULT_LANGUAGE=[us_english]
END
GO


--Users for Automation.
USE [Automation]
GO

IF NOT EXISTS (SELECT * FROM Automation.dbo.sysusers WHERE name = N'EUR\ldnctisvcwapsdv01')
BEGIN
	CREATE USER [EUR\ldnctisvcwapsdv01] FOR LOGIN [EUR\ldnctisvcwapsdv01] WITH DEFAULT_SCHEMA=[dbo]
END
GO

USE [Automation]
GO

IF NOT EXISTS (SELECT * FROM Automation.dbo.sysusers WHERE name = N'EUR\ldnctisvcwapsdv02')
BEGIN
	CREATE USER [EUR\ldnctisvcwapsdv02] FOR LOGIN [EUR\ldnctisvcwapsdv02] WITH DEFAULT_SCHEMA=[dbo]
END
GO

USE [Automation]
GO

IF NOT EXISTS (SELECT * FROM Automation.dbo.sysusers WHERE name = N'EUR\ldnctisvcwapspr01')
BEGIN
	CREATE USER [EUR\ldnctisvcwapspr01] FOR LOGIN [EUR\ldnctisvcwapspr01] WITH DEFAULT_SCHEMA=[dbo]
END
GO

USE [Automation]
GO

IF NOT EXISTS (SELECT * FROM Automation.dbo.sysusers WHERE name = N'EUR\ldnctisvcwapspr02')
BEGIN
	CREATE USER [EUR\ldnctisvcwapspr02] FOR LOGIN [EUR\ldnctisvcwapspr02] WITH DEFAULT_SCHEMA=[dbo]
END
GO

USE [Automation]
GO

IF NOT EXISTS (SELECT * FROM Automation.dbo.sysusers WHERE name = N'EUR\ldnctisvcwapsua01')
BEGIN
	CREATE USER [EUR\ldnctisvcwapsua01] FOR LOGIN [EUR\ldnctisvcwapsua01] WITH DEFAULT_SCHEMA=[dbo]
END
GO

USE [Automation]
GO

IF NOT EXISTS (SELECT * FROM Automation.dbo.sysusers WHERE name = N'EUR\ldnctisvcwapsua02')
BEGIN
	CREATE USER [EUR\ldnctisvcwapsua02] FOR LOGIN [EUR\ldnctisvcwapsua02] WITH DEFAULT_SCHEMA=[dbo]
END
GO

USE [Automation]
GO

EXEC sp_addrolemember N'db_owner', N'EUR\ldnctisvcwapsdv01'
GO

EXEC sp_addrolemember N'db_owner', N'EUR\ldnctisvcwapsdv02'
GO

EXEC sp_addrolemember N'db_owner', N'EUR\ldnctisvcwapspr01'
GO

EXEC sp_addrolemember N'db_owner', N'EUR\ldnctisvcwapspr02'
GO

EXEC sp_addrolemember N'db_owner', N'EUR\ldnctisvcwapsua01'
GO

EXEC sp_addrolemember N'db_owner', N'EUR\ldnctisvcwapsua02'
GO

--ISA_Roles procedure for MEIL
USE [Automation]
GO

IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[proc_ISA_Roles_165986]') AND type in (N'P', N'PC'))
DROP PROCEDURE [dbo].[proc_ISA_Roles_165986]
GO

USE [Automation]
GO

CREATE PROCEDURE [dbo].[proc_ISA_Roles_165986]
AS
BEGIN
	SET NOCOUNT ON;
	EXEC proc_ISA_GetRoles 165986
END

GO

--Grant Access
GRANT EXEC ON [proc_EERS_165986] TO [EUR\ldnctisvcwapsdv01]
GRANT EXEC ON [proc_ISA_Roles_165986] TO [EUR\ldnctisvcwapsdv01]
GRANT EXEC ON [proc_EERS_165986] TO [EUR\ldnctisvcwapsdv02]
GRANT EXEC ON [proc_ISA_Roles_165986] TO [EUR\ldnctisvcwapsdv02]
GO

GRANT EXEC ON [proc_EERS_165986] TO [EUR\ldnctisvcwapspr01]
GRANT EXEC ON [proc_ISA_Roles_165986] TO [EUR\ldnctisvcwapspr01]
GRANT EXEC ON [proc_EERS_165986] TO [EUR\ldnctisvcwapspr02]
GRANT EXEC ON [proc_ISA_Roles_165986] TO [EUR\ldnctisvcwapspr02]
GO

GRANT EXEC ON [proc_EERS_165986] TO [EUR\ldnctisvcwapsua01]
GRANT EXEC ON [proc_ISA_Roles_165986] TO [EUR\ldnctisvcwapsua01]
GRANT EXEC ON [proc_EERS_165986] TO [EUR\ldnctisvcwapsua02]
GRANT EXEC ON [proc_ISA_Roles_165986] TO [EUR\ldnctisvcwapsua02]
GO
