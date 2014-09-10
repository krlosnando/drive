public static System.Data.DataTable GetDataTableFromExcel(AjaxControlToolkit.AsyncFileUpload pfileUpload, String puploadFolder, String psheetName, String pfileID)
{
    System.Data.DataTable retval = null;
    try
    {
        if (pfileUpload.HasFile)
        {
            string userSOEID = Session_Util.GetSOEID();
            String _path = String.Empty;
            String _fileName = String.Empty;
            _fileName = pfileUpload.FileName;

            //Save file
            String uploadFolder = System.Configuration.ConfigurationManager.AppSettings.Get("Upload_Folder").ToString();
            uploadFolder += puploadFolder;

            _path = System.Web.HttpContext.Current.Server.MapPath(uploadFolder);
            _path = _path + pfileID + "_" + _fileName;
            pfileUpload.SaveAs(_path);

            string strConn = null;

            strConn = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + _path + ";Extended Properties=Excel 12.0;";

            using (System.Data.OleDb.OleDbConnection conn = new System.Data.OleDb.OleDbConnection(strConn))
            {
                conn.Open();
                using (System.Data.OleDb.OleDbCommand cmd = new System.Data.OleDb.OleDbCommand("SELECT * FROM [" + psheetName + "$]", conn))
                {
                    cmd.CommandType = System.Data.CommandType.Text;
                    using (System.Data.OleDb.OleDbDataAdapter da = new System.Data.OleDb.OleDbDataAdapter(cmd))
                    {
                        retval = new System.Data.DataTable();
                        da.Fill(retval);
                    }
                }
                conn.Close();
            }
        }
        else
        {
            System.Web.HttpContext.Current.Session["uploadMessage"] = "UploadError: No file";
        }
    }
    catch (UtilException uEx)
    {
        if (uEx.OriginalException.ToString().Contains("user-defined table type requires 77 column"))
        {
            System.Web.HttpContext.Current.Session["uploadMessage"] = "UploadError: The Sheet in the excel must be have 77 columns (ID, DepartmentID, Department, Process, Group, Activity, RecoverableTCD, OwnerSOEID, OwnerName, OwnerWorkPhone, OwnerHomePhone, OwnerAlternatePhone, OwnerEmail, BackupSOEID, BackupName, BackupWorkPhone, BackupHomePhone, BackupAlternatePhone, BackupEmail, BackupCenter, TCDSOEID, TCDName, TCDWorkPhone, TCDHomePhone, TCDAlternatePhone, TCDEmail, TCDCenter, GPLSOEID, GPLName, GPLWorkPhone, GPLHomePhone, GPLAlternatePhone, GPLEmail, GPLCenter, Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec, BD-14, BD-13, BD-12, BD-11, BD-10, BD-9, BD-8, BD-7, BD-6, BD-5, BD-4, BD-3, BD-2, BD-1, BD1, BD2, BD3, BD4, BD5, BD6, BD7, BD8, BD9, BD10, BD11, BD12, BD13, BD14, BD15, BD16, BD17, BD18, BD19, BD20, BD21, DocumentLink), please review witch columns are missing in your file.";
        }
        else
        {
            System.Web.HttpContext.Current.Session["uploadMessage"] = "Exception: " + uEx.OriginalException.ToString();
        }
    }
    catch (Exception ex)
    {
        if (ex.ToString().Contains("'" + psheetName + "$' is not a valid name."))
        {
            System.Web.HttpContext.Current.Session["uploadMessage"] = "UploadError: The Sheet name in the excel must be '" + psheetName + "'.";
        }
        else
        {
            UtilException uEx = new UtilException(ex);
            uEx.StackTrace.Add((System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name) + " : " + (System.Reflection.MethodBase.GetCurrentMethod().Name));
            uEx.SoeidSession = Session_Util.GetSOEID();
            uEx.SaveExceptionInBD();

            System.Web.HttpContext.Current.Session["uploadMessage"] = "Exception: " + uEx.OriginalException.ToString();
        }
    }
    return retval;
}

protected void uploadEmployeesInformation(object sender, AjaxControlToolkit.AsyncFileUploadEventArgs e)
{
    try
    {
        String _fileID = Session_Util.CreateCustomID();
        System.Data.DataTable data = Session_Util.GetDataTableFromExcel(fileUploadEmployeesInformation, "EmployeeInformation/", "EmployeeInformation", _fileID);
        if (data != null && data.Rows.Count > 0)
        {
            (new FileManager()).uploadFile(data, Session_Util.GetSOEID(), _fileID, "FROU_spUploadTemplateEmployeeInformation", DateTime.Now.ToShortDateString());
            Session["uploadMessage"] = "Success: The file was uploaded successfully";
        }
    }
    catch (UtilException uEx)
    {
        uEx.SoeidSession = Session_Util.GetSOEID();
        Session["uploadMessage"] = "Exception: " + uEx.OriginalException.ToString();
    }
    catch (Exception ex)
    {
        UtilException uEx = new UtilException(ex);
        uEx.StackTrace.Add((System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name) + " : " + (System.Reflection.MethodBase.GetCurrentMethod().Name));
        uEx.SoeidSession = Session_Util.GetSOEID();
        uEx.SaveExceptionInBD();

        Session["uploadMessage"] = "Exception: " + uEx.OriginalException.ToString();
    }
}

public void uploadFile(DataTable pdataExcel, String psoeid, String pfileID, String pspName, String puploadedDate)
{
    try
    {
        SqlCommand _command = new SqlCommand(pspName, DAO.Connection.Conn);
        _command.CommandType = CommandType.StoredProcedure;
        _command.CommandTimeout = 999999999;

        SqlParameter _table = new SqlParameter("@EXCELTABLE", SqlDbType.Structured);
        SqlParameter _soeid = new SqlParameter("@SOEID_UPLOADER", SqlDbType.VarChar);
        SqlParameter _fileID = new SqlParameter("@FILE_ID", SqlDbType.VarChar);
        SqlParameter _uploadedDate = new SqlParameter("@UPLOADED_DATE", SqlDbType.VarChar);

        _table.Value = pdataExcel;
        _soeid.Value = psoeid;
        _fileID.Value = pfileID;
        _uploadedDate.Value = puploadedDate;

        _command.Parameters.Add(_table);
        _command.Parameters.Add(_soeid);
        _command.Parameters.Add(_fileID);
        if (!String.IsNullOrEmpty(puploadedDate))
        {
            _command.Parameters.Add(_uploadedDate);    
        }

        DAO.Connection.OpenConn();
        _command.ExecuteNonQuery();
        DAO.Connection.CloseConn(); 

    }
    catch (UtilException uEx)
    {
        uEx.StackTrace.Add((System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name) + " : " + (System.Reflection.MethodBase.GetCurrentMethod().Name));
        throw uEx;
    }
    catch (Exception ex)
    {
        UtilException uEx = new UtilException(ex);
        uEx.OriginalExceptionClass = System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name;
        uEx.OriginalExceptionMethod = System.Reflection.MethodBase.GetCurrentMethod().Name;
        uEx.StackTrace.Add(uEx.OriginalExceptionClass + " : " + uEx.OriginalExceptionMethod);
        throw uEx;
    }
}
