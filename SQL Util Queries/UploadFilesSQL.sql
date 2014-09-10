USE [HRTTDB]
GO

/****** Object:  UserDefinedTableType [dbo].[FROU_templateSkillMapping]    Script Date: 9/10/2014 11:50:42 AM ******/
CREATE TYPE [dbo].[FROU_templateSkillMapping] AS TABLE(
	[GlobalProcess] [varchar](255) NULL,
	[ProcessRole] [varchar](255) NULL,
	[Competency] [varchar](255) NULL,
	[Skill] [varchar](255) NULL,
	[SkillDescription] [varchar](500) NULL,
	[ProficiencyLevelBasic] [varchar](5000) NULL,
	[ProficiencyLevelIntermediate] [varchar](5000) NULL,
	[ProficiencyLevelAdvance] [varchar](5000) NULL,
	[Analyst] [varchar](100) NULL,
	[SeniorAnalyst] [varchar](100) NULL,
	[Manager] [varchar](100) NULL,
	[SeniorManager] [varchar](100) NULL
)
GO

USE [HRTTDB]
GO
/****** Object:  StoredProcedure [dbo].[FROU_spUploadTemplateSkillMapping]    Script Date: 9/10/2014 11:47:52 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- ===============================================================
-- Created by:	Carlos Dominguez Lara
-- Create date: Tuesday, May 27, 2014
-- Description:	Upload Skill Item Excel template
-- ===============================================================
ALTER PROCEDURE [dbo].[FROU_spUploadTemplateSkillMapping]
	@EXCELTABLE dbo.FROU_templateSkillMapping READONLY,
	@SOEID_UPLOADER VARCHAR(10),
	@FILE_ID VARCHAR(16)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	
	DECLARE 
		@ID INT,
		@GlobalProcess VARCHAR(255),
		@ProcessRole VARCHAR(255),
		@Competency VARCHAR(255),
		@Skill VARCHAR(255),
		@SkillDescription VARCHAR(500),
		@ProficiencyLevelBasic VARCHAR(5000),
		@ProficiencyLevelIntermediate VARCHAR(5000),
		@ProficiencyLevelAdvance VARCHAR(5000),
		@ProficiencyLevelSkillItems VARCHAR(5000),
		@Analyst VARCHAR(100),
		@SeniorAnalyst VARCHAR(100),
		@Manager VARCHAR(100),
		@SeniorManager VARCHAR(100),
		
		@IDGlobalProcess INT,
		@IDProcessRole INT,
		@IDCompetency INT,
		@IDSkill INT,
		@IDProficiencyLevelBasic INT = 1,
		@IDProficiencyLevelIntermediate INT = 2,
		@IDProficiencyLevelAdvance INT = 3,
		
		@PLCounterFlagId INT = 1,
		@PLMaxFlagId INT = 3,
		@SkillItemCounterFlagId INT,
		@SkillItemMaxFlagId INT,
		
		@SkillItem VARCHAR(500),
		@IDSkillItem INT,
		
		@SkillItemCode VARCHAR(100) = '',
		@SkillItemTypeCode VARCHAR(10) = '',
		@IDNextSkillItem VARCHAR(10),
		@IDSkillItemType INT = 1, --Skill Set
		
		@JobLevelCounterFlagId INT,
		@JobLevelMaxFlagId INT = 4,
		@TempProficiencyLevelName VARCHAR(100),
		@IDTempProficiencyLevel INT,
		@IDProcessRoleMapping INT
		
	DECLARE
		@SkillItemTempTable AS TABLE(
			[Id] INT,
			[Type] varchar(50),
			[Data] varchar(500)
		)
		
	TRUNCATE TABLE dbo.FROU_tblSkillMappingStage
	
	--Insert New Rows in the excel
	INSERT INTO dbo.FROU_tblSkillMappingStage(
		 [GlobalProcess]
		,[ProcessRole]
		,[Competency]
		,[Skill]
		,[SkillDescription]
		,[ProficiencyLevelBasic]
		,[ProficiencyLevelIntermediate]
		,[ProficiencyLevelAdvance]
		,[Analyst]
		,[SeniorAnalyst]
		,[Manager]
		,[SeniorManager]
		,[CreatedDate]
		,[CreatedBy]
		,[FileID]
	)
	SELECT
		 [GlobalProcess]
		,[ProcessRole]
		,[Competency]
		,[Skill]
		,[SkillDescription]
		,[ProficiencyLevelBasic]
		,[ProficiencyLevelIntermediate]
		,[ProficiencyLevelAdvance]
		,[Analyst]
		,[SeniorAnalyst]
		,[Manager]
		,[SeniorManager]
		,GETDATE()
		,@SOEID_UPLOADER
		,@FILE_ID
	FROM 
		@EXCELTABLE ET
	WHERE 
		--Delete the first two columns
		NOT( GlobalProcess = 'Global Process' OR GlobalProcess IS NULL )

	--Insert Skills
	DECLARE DB_CURSOR CURSOR FAST_FORWARD 
	FOR  
		SELECT
			 [ID]
			,[GlobalProcess]
			,[ProcessRole]
			,[Competency]
			,[Skill]
			,[SkillDescription]
			,[ProficiencyLevelBasic]
			,[ProficiencyLevelIntermediate]
			,[ProficiencyLevelAdvance]
			,[Analyst]
			,[SeniorAnalyst]
			,[Manager]
			,[SeniorManager]
		FROM 
			dbo.FROU_tblSkillMappingStage
	
	OPEN DB_CURSOR   
	FETCH NEXT FROM DB_CURSOR 
	INTO 
	@ID, @GlobalProcess, @ProcessRole, @Competency, @Skill, 
	@SkillDescription, @ProficiencyLevelBasic, @ProficiencyLevelIntermediate,
	@ProficiencyLevelAdvance, @Analyst, @SeniorAnalyst, @Manager, @SeniorManager

	WHILE @@FETCH_STATUS = 0   
	BEGIN   
		SET @IDGlobalProcess = NULL
		SET @IDProcessRole = NULL
		SET @IDCompetency = NULL
		SET @IDSkill = NULL
		
		--GlobalProcess
		SELECT @IDGlobalProcess = ID FROM dbo.FROU_tblGlobalProcess WHERE Name = @GlobalProcess
		IF @IDGlobalProcess IS NULL
		BEGIN
			INSERT INTO dbo.FROU_tblGlobalProcess([Name], [Description], [Status])
			VALUES(@GlobalProcess, @GlobalProcess, 1)
			
			SELECT @IDGlobalProcess = IDENT_CURRENT('FROU_tblGlobalProcess')
		END
		
		--ProcessRole
		SELECT @IDProcessRole = ID FROM dbo.FROU_tblProcessRole WHERE Name = @ProcessRole AND [IDGlobalProcess] = @IDGlobalProcess
		IF @IDProcessRole IS NULL
		BEGIN
			INSERT INTO dbo.FROU_tblProcessRole([Name], [Description], [Status], [IDGlobalProcess])
			VALUES(@ProcessRole, @ProcessRole, 1, @IDGlobalProcess)
			
			SELECT @IDProcessRole = IDENT_CURRENT('FROU_tblProcessRole')
		END
		
		--Competency
		--PRINT 'Competency => ' + @Competency
		SELECT @IDCompetency = ID FROM dbo.FROU_tblCompetency WHERE Name = @Competency
		IF @IDCompetency IS NULL
		BEGIN
			INSERT INTO dbo.FROU_tblCompetency([Name], [Description], [Status])
			VALUES(@Competency, @Competency, 1)
			
			SELECT @IDCompetency = IDENT_CURRENT('FROU_tblCompetency')
		END
		
		--Skill
		--PRINT 'Skill => ' + @Skill
		SELECT @IDSkill = ID FROM dbo.FROU_tblSkill WHERE Name = @Skill AND [IDCompetency] = @IDCompetency
		IF @IDSkill IS NULL
		BEGIN
			INSERT INTO dbo.FROU_tblSkill([Name], [Description], [Status], [IsTemp], [IDCompetency])
			VALUES(@Skill, ISNULL(@SkillDescription, @Skill), 1, 0, @IDCompetency)
			
			SELECT @IDSkill = IDENT_CURRENT('FROU_tblSkill')
		END
				
		--Add Skill Items by Proficiency Level
		SET @PLCounterFlagId = 1
		WHILE(@PLCounterFlagId <= @PLMaxFlagId)
		BEGIN
			SELECT @ProficiencyLevelSkillItems = 
				CASE @PLCounterFlagId 
					WHEN 1 THEN @ProficiencyLevelBasic
					WHEN 2 THEN @ProficiencyLevelIntermediate
					WHEN 3 THEN @ProficiencyLevelAdvance
					ELSE ''
				END
				
			DELETE FROM @SkillItemTempTable
			
			INSERT INTO @SkillItemTempTable([Id], [Type], [Data])
			SELECT [Id], [Type], [Data] 
			FROM dbo.FROU_fnSplitString(@ProficiencyLevelSkillItems,'SKILL_ITEM:')
			
			SELECT @SkillItemCounterFlagId = MIN([Id]) 
			FROM @SkillItemTempTable
			
			SELECT @SkillItemMaxFlagId = MAX([Id]) 
			FROM @SkillItemTempTable
			
			WHILE (@SkillItemCounterFlagId <= @SkillItemMaxFlagId)
			BEGIN
				SET @SkillItem = NULL
				SELECT @SkillItem = [Data] FROM @SkillItemTempTable WHERE [Id] = @SkillItemCounterFlagId
				
				--SkillItem
				SET @IDSkillItem = NULL
				SELECT @IDSkillItem = ID FROM dbo.FROU_tblSkillItem WHERE Name = @SkillItem
				
				IF ISNULL(@SkillItem, '') <> ''
				BEGIN
					IF @IDSkillItem IS NULL 
					BEGIN
						SELECT @SkillItemTypeCode = SIT.Code
						FROM dbo.FROU_tblSkillItemType SIT
						WHERE SIT.ID = @IDSkillItemType
						
						SELECT @IDNextSkillItem = CONVERT(VARCHAR,IDENT_CURRENT('FROU_tblSkillItem') + 1)
						
						SELECT @SkillItemCode = @SkillItemTypeCode + REPLICATE('0', 6 - DATALENGTH(@IDNextSkillItem)) + @IDNextSkillItem
						
						INSERT INTO dbo.FROU_tblSkillItem([Name], [Description], [Code], [IDSkillItemType], [IsGLMS], [Status])
						VALUES(@SkillItem, @SkillItem, @SkillItemCode, @IDSkillItemType, 0, 1)
						
						SELECT @IDSkillItem = IDENT_CURRENT('FROU_tblSkillItem')
					END
					
					EXEC [dbo].[FROU_spAdminAddSkillItemToSkill]
						@IDSkill  = @IDSkill,
						@IDProficiencyLevel = @PLCounterFlagId, --Current ID of Proficiency Level
						@IDSkillItem = @IDSkillItem,
						@IsGLMS = 0
				END
				
				SET @SkillItemCounterFlagId = @SkillItemCounterFlagId + 1
			END
		
			SET @PLCounterFlagId = @PLCounterFlagId + 1
		END
		
		--Add IDProcessRole - IDJobLevel - IDSkill - IDProficiencyLevel
		SET @JobLevelCounterFlagId = 1
		WHILE(@JobLevelCounterFlagId <= @JobLevelMaxFlagId)
		BEGIN
			SELECT @TempProficiencyLevelName = 
				CASE @JobLevelCounterFlagId 
					WHEN 1 THEN @Analyst
					WHEN 2 THEN @SeniorAnalyst
					WHEN 3 THEN @Manager
					WHEN 4 THEN @SeniorManager
					ELSE ''
				END
				
			SELECT @IDTempProficiencyLevel = P.ID
			FROM dbo.FROU_tblProficiencyLevel P
			WHERE P.Name = @TempProficiencyLevelName
			
			--FROU_tblProcessRoleMapping
			SET @IDProcessRoleMapping = NULL
			
			SELECT @IDProcessRoleMapping = ID 
			FROM dbo.FROU_tblProcessRoleMapping 
			WHERE 
				[IDProcessRole] = @IDProcessRole AND
				[IDSkill] = @IDSkill AND 
				[IDJobLevel] = @JobLevelCounterFlagId AND 
				[IDProficiencyLevel] = @IDTempProficiencyLevel
			
			IF @IDProcessRoleMapping IS NULL AND @IDTempProficiencyLevel IS NOT NULL
			BEGIN
				INSERT INTO dbo.FROU_tblProcessRoleMapping([IDProcessRole], [IDSkill], [IDJobLevel], [IDProficiencyLevel])
				VALUES(@IDProcessRole, @IDSkill, @JobLevelCounterFlagId, @IDTempProficiencyLevel)
			END
			
			SET @JobLevelCounterFlagId = @JobLevelCounterFlagId + 1
		END
		
		FETCH NEXT FROM DB_CURSOR 
		INTO 
		@ID, @GlobalProcess, @ProcessRole, @Competency, @Skill, 
		@SkillDescription, @ProficiencyLevelBasic, @ProficiencyLevelIntermediate,
		@ProficiencyLevelAdvance, @Analyst, @SeniorAnalyst, @Manager, @SeniorManager
	END   

	CLOSE DB_CURSOR   
	DEALLOCATE DB_CURSOR
END


