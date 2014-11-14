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
			[ID] = @IDDelegate
	END
	ELSE
	BEGIN
		SELECT @IDExistingDelete = (SELECT S.ID FROM [dbo].[FROU_tblSecurityDelegate] S WHERE S.[SOEID] = @SOEID ) --AND [ManagerSOEID] = @UserSOEID
		
		--If user selects a existing Delegate, Do merge with Employees and delete duplicate row
		UPDATE 
			SDE
		SET 
			SDE.[IDDelegate] = @IDExistingDelete
		FROM
			[dbo].[FROU_tblSecurityDelegateXEmployee] SDE
		WHERE 
			SDE.[IDDelegate] = @IDDelegate AND

			--Avoid duplicate Employees to one Delegate
			0 = (SELECT COUNT(1) AS ExistsEmployee 
				 FROM [dbo].[FROU_tblSecurityDelegateXEmployee] TSDE
				 WHERE TSDE.SOEID = SDE.[SOEID] AND TSDE.[IDDelegate] = @IDExistingDelete)
				 
		--Delete employees of duplicate delegate
		DELETE FROM
			[dbo].[FROU_tblSecurityDelegateXEmployee]
		WHERE
			[IDDelegate] = @IDDelegate

		--Delete delegate
		DELETE FROM 
			[dbo].[FROU_tblSecurityDelegate]
		WHERE 
			[ID] = @IDDelegate
	END
	
	SELECT @IDNewRow = @IDDelegate
END
