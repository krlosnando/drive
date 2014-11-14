IF @Action = 'Edit'
BEGIN
	IF NOT EXISTS(SELECT 1 FROM [dbo].[FROU_tblSecurityDelegate] S WHERE S.[SOEID] = @SOEID ) --AND [ManagerSOEID] = @UserSOEID
	BEGIN
		UPDATE 
			[dbo].[FROU_tblSecurityDelegate]
		SET 
			[SOEID] = @SOEID,
			[ModifiedBy] = @UserSOEID,
			[ModifiedDate] = GETDATE()
		WHERE 
			[ID] = @IDDelegateClientGrid
	END
	ELSE
	BEGIN
		SELECT @IDDeleteExistingInDB = (SELECT S.ID FROM [dbo].[FROU_tblSecurityDelegate] S WHERE S.[SOEID] = @SOEID ) --AND [ManagerSOEID] = @UserSOEID
		
		--If user selects a existing Delegate, Do merge with Employees and delete duplicate row
		UPDATE 
			SDE
		SET 
			SDE.[IDDelegate] = @IDDeleteExistingInDB
		FROM
			[dbo].[FROU_tblSecurityDelegateXEmployee] SDE
		WHERE 
			SDE.[IDDelegate] = @IDDelegateClientGrid AND

			--Avoid duplicate Employees to one Delegate
			0 = (SELECT COUNT(1) AS ExistsEmployee 
				 FROM [dbo].[FROU_tblSecurityDelegateXEmployee] TSDE
				 WHERE TSDE.SOEID = SDE.[SOEID] AND TSDE.[IDDelegate] = @IDDeleteExistingInDB)
				 
		--Delete employees of duplicate delegate
		DELETE FROM
			[dbo].[FROU_tblSecurityDelegateXEmployee]
		WHERE
			[IDDelegate] = @IDDelegateClientGrid

		--Delete delegate
		DELETE FROM 
			[dbo].[FROU_tblSecurityDelegate]
		WHERE 
			[ID] = @IDDelegateClientGrid
	END
	
	SELECT @IDNewRow = @IDDelegateClientGrid
END
