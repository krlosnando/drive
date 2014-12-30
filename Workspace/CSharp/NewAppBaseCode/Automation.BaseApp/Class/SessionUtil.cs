using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Web;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using Newtonsoft.Json;

namespace Automation.BaseApp.Class
{
    /// <summary>
    /// Programmer: Carlos Dominguez
    /// Date: Monday, October 07, 2013
    /// Description: Class to control the errors of the application
    /// Modify by: Carlos Dominguez
    /// Date of last modified: Monday, October 07, 2013
    /// Version: 2.1
    /// </summary> 
    /// <remarks></remarks>
    public static class SessionUtil
    {
        public static bool sessionWasRefreshed = false;
        public static string baseThemeUrl = "../App_Themes/Base";

        public static string GetAppSetting(string pkey)
        {
            string appSetting = "";
            try
            {
                // Get DLL configuration options
                string assemblyPath = new Uri(Assembly.GetExecutingAssembly().CodeBase).AbsolutePath;
                Configuration cfg = ConfigurationManager.OpenExeConfiguration(assemblyPath);

                appSetting = cfg.AppSettings.Settings[pkey].Value;
            }
            catch (UtilException uEx)
            {
                uEx.StackTrace.Add((System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name) + " : " + (System.Reflection.MethodBase.GetCurrentMethod().Name));
                uEx.SoeidSession = GetSOEID();
                uEx.SaveExceptionInBD();
                ShowErrorMessage(uEx);
            }
            catch (Exception ex)
            {
                UtilException uEx = new UtilException(ex);
                uEx.StackTrace.Add((System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name) + " : " + (System.Reflection.MethodBase.GetCurrentMethod().Name));
                uEx.SoeidSession = GetSOEID();
                uEx.SaveExceptionInBD();
                ShowErrorMessage(uEx);
            }
            return appSetting;
        }

        public static string GetConnectionString(string pkey)
        {
            string connString = "";
            try
            {
                // Get DLL configuration options
                string assemblyPath = new Uri(Assembly.GetExecutingAssembly().CodeBase).AbsolutePath;
                Configuration cfg = ConfigurationManager.OpenExeConfiguration(assemblyPath);

                connString = cfg.ConnectionStrings.ConnectionStrings[pkey].ToString();
            }
            catch (UtilException uEx)
            {
                uEx.StackTrace.Add((System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name) + " : " + (System.Reflection.MethodBase.GetCurrentMethod().Name));
                uEx.SoeidSession = GetSOEID();
                uEx.SaveExceptionInBD();
                ShowErrorMessage(uEx);
            }
            catch (Exception ex)
            {
                UtilException uEx = new UtilException(ex);
                uEx.StackTrace.Add((System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name) + " : " + (System.Reflection.MethodBase.GetCurrentMethod().Name));
                uEx.SoeidSession = GetSOEID();
                uEx.SaveExceptionInBD();
                ShowErrorMessage(uEx);
            }
            return connString;
        }

        public static string GetSOEID()
        {
            string SOEID = "";
            try
            {
                //Query String User
                string psoeid = HttpContext.Current.Request.QueryString["psoeid"];
                if (!String.IsNullOrEmpty(psoeid))
                {
                    HttpContext.Current.Session["TestUser"] = psoeid;
                    SOEID = psoeid;

                    //We can call this every where, but only once by post back is executed "sessionWasRefreshed"
                    RefreshSession();
                }
                else
                {
                    if (HttpContext.Current.Session["TestUser"] != null)
                    {
                        SOEID = HttpContext.Current.Session["TestUser"].ToString();
                    }
                }

                string pclear = HttpContext.Current.Request.QueryString["pclear"];
                if (!String.IsNullOrEmpty(pclear))
                {
                    HttpContext.Current.Session.Remove("TestUser");
                    SOEID = "";
                    //We can call this every where, but only once by post back is executed "sessionWasRefreshed"
                    RefreshSession();
                }

                //Priority to queryString
                if (!String.IsNullOrEmpty(SOEID))
                {
                    return SOEID;
                }

                //SSO User
                if (HttpContext.Current.Request.Headers.Get("SM_User") != null)
                {
                    SOEID = HttpContext.Current.Request.Headers.Get("SM_User").ToString();
                }

                //Try with Windows User if SSO not exists
                if (String.IsNullOrEmpty(SOEID))
                {
                    string UserLine = HttpContext.Current.User.Identity.Name.ToString();
                    if (!String.IsNullOrEmpty(UserLine))
                    {
                        string[] UserRow = UserLine.Split('\\');
                        SOEID = UserRow[1].ToUpper();
                    }
                }

                //Try with web.config User if SSO and Windows User not exist
                if (!String.IsNullOrEmpty(System.Configuration.ConfigurationManager.AppSettings["SOEIDOverride"]))
                {
                    SOEID = System.Configuration.ConfigurationManager.AppSettings["SOEIDOverride"].ToString();
                }
            }
            catch (UtilException uEx)
            {
                uEx.StackTrace.Add((System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name) + " : " + (System.Reflection.MethodBase.GetCurrentMethod().Name));
                uEx.SoeidSession = "Error Getting SOEID";
                uEx.SaveExceptionInBD();
                ShowErrorMessage(uEx);
            }
            catch (Exception ex)
            {
                UtilException uEx = new UtilException(ex);
                uEx.StackTrace.Add((System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name) + " : " + (System.Reflection.MethodBase.GetCurrentMethod().Name));
                uEx.SoeidSession = GetSOEID();
                uEx.SaveExceptionInBD();
                ShowErrorMessage(uEx);
            }

            if (!String.IsNullOrEmpty(SOEID))
            {
                return SOEID;
            }
            else
            {
                throw new Exception("GetSOEID() : [SOEID NOT FOUND] : No SOEID in Session");
            }
        }

        public static Employee GetUser()
        {
            //cls_Employee _objUser = null;

            try
            {
                //_objUser = HttpContext.Current.Session["USER"] as cls_Employee;
                //if (_objUser == null)
                //{
                //    RefreshSession();
                //    _objUser = HttpContext.Current.Session["USER"] as cls_Employee;

                //    if (_objUser == null)
                //    {
                //        throw new Exception("[cls_Employee not found]: GetUser() return null");
                //    }
                //}
            }
            catch (System.Threading.ThreadAbortException)
            {
                //Ignore Redirect Exception: System.Threading.ThreadAbortException: Thread was being aborted.
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
            return new Employee();
        }

        public static void RefreshSession()
        {
            try
            {
                if (sessionWasRefreshed == false)
                {
                    //Refresh session only One time by post back
                    sessionWasRefreshed = true;


                }
            }
            catch (System.Threading.ThreadAbortException)
            {
                //Ignore Redirect Exception: System.Threading.ThreadAbortException: Thread was being aborted.
            }
            catch (UtilException uEx)
            {
                uEx.StackTrace.Add((System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name) + " : " + (System.Reflection.MethodBase.GetCurrentMethod().Name));
                uEx.SoeidSession = GetSOEID();
                throw uEx;
            }
            catch (Exception ex)
            {
                UtilException uEx = new UtilException(ex);
                uEx.OriginalExceptionClass = System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name;
                uEx.OriginalExceptionMethod = System.Reflection.MethodBase.GetCurrentMethod().Name;
                uEx.StackTrace.Add(uEx.OriginalExceptionClass + " : " + uEx.OriginalExceptionMethod);
                uEx.SoeidSession = GetSOEID();
                throw uEx;
            }
        }

        public static string GetUpdatedUserRoles()
        {
            string userRoles = "";
            try
            {
                userRoles += "Admin";
                //using (SqlCommand comm = SQL_GetSPCommand("FROU_spAdminSecurityUsersXRolesList"))
                //{
                //    comm.Parameters.Add(new SqlParameter("@SOEID", GetSOEID()));

                //    // Execute the command
                //    comm.Connection.Open();
                //    SqlDataReader rdr = comm.ExecuteReader();

                //    while (rdr.Read())
                //    {
                //        if (rdr["Grant"].ToString() == "True" || rdr["Grant"].ToString() == "1")
                //        {
                //            userRoles += rdr["RoleName"].ToString() + ", ";
                //        }
                //    }

                //    comm.Connection.Close();
                //}
            }
            catch (UtilException uEx)
            {
                uEx.StackTrace.Add((System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name) + " : " + (System.Reflection.MethodBase.GetCurrentMethod().Name));
                uEx.SoeidSession = GetSOEID();
                uEx.SaveExceptionInBD();
                ShowErrorMessage(uEx);
            }
            catch (Exception ex)
            {
                UtilException uEx = new UtilException(ex);
                uEx.StackTrace.Add((System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name) + " : " + (System.Reflection.MethodBase.GetCurrentMethod().Name));
                uEx.SoeidSession = GetSOEID();
                uEx.SaveExceptionInBD();
                ShowErrorMessage(uEx);
            }
            return userRoles;
        }

        public static string GetUserRoles(bool forceRefreshRoles)
        {
            var roles = "";
            roles = (string)HttpContext.Current.Session["USER_ROLES"];
            string prefresh = HttpContext.Current.Request.QueryString["prefreshRoles"];

            if (roles == null || prefresh == "1" || forceRefreshRoles)
            {
                HttpContext.Current.Session["USER_ROLES"] = GetUpdatedUserRoles();
                roles = (string)HttpContext.Current.Session["USER_ROLES"];
            }

            return roles;
        }

        public static Dictionary<string, UIMenuItem> GetMenuByRol(String prolName)
        {
            Dictionary<string, UIMenuItem> menu = new Dictionary<string, UIMenuItem>();

            menu.Add("Home", new UIMenuItem()
            {
                Url = "INTER_Default.aspx",
                Title = "Intercompany Home Page",
                Text = "Portal Home"
            });

            menu.Add("Summary", new UIMenuItem()
            {
                Url = "INTER_Summary.aspx",
                Title = "Summary",
                Text = "Summary"
            });

            menu.Add("UploadFiles", new UIMenuItem()
            {
                Url = "INTER_AdminUploadFiles.aspx",
                Title = "Upload Files",
                Text = "Upload Files"
            });

            return menu;
        }

        public static void CreateMenu(ref HtmlGenericControl nav, String rol)
        {
            Dictionary<string, UIMenuItem> menu = GetMenuByRol(rol);

            //Add item to nav
            foreach (KeyValuePair<string, UIMenuItem> menuItem in menu)
            {
                HtmlGenericControl li = CreateItemMenu(menuItem.Value);
                nav.Controls.Add(li);
            }
        }

        public static HtmlGenericControl CreateItemMenu(UIMenuItem item)
        {
            HtmlGenericControl li = new HtmlGenericControl("li");
            HtmlGenericControl a = new HtmlGenericControl("a");
            a.Attributes.Add("href", item.Url);
            a.InnerText = item.Text;

            if (!String.IsNullOrEmpty(item.Title))
            {
                a.Attributes.Add("title", item.Title);
            }

            if (item.IsTargetBlank)
            {
                a.Attributes.Add("target", "_blank");
            }

            if (item.Nodes != null && item.Nodes.Count > 0)
            {
                a.Attributes.Add("onclick", "return false;");
            }

            li.Controls.Add(a);

            if (item.Nodes != null && item.Nodes.Count > 0)
            {
                HtmlGenericControl subul = new HtmlGenericControl("ul");
                foreach (UIMenuItem subitem in item.Nodes)
                {
                    //Recursive method "CreateItemMenu"
                    HtmlGenericControl subli = CreateItemMenu(subitem);
                    subul.Controls.Add(subli);
                }
                li.Controls.Add(subul);
            }

            return li;
        }

        public static String CreateCustomID()
        {
            return DateTime.Now.ToString("yyyyMMddHmmssff");
        }

        public static void ShowMessage(string pMessage, string pType)
        {
            //pType = alert - success - error - warning - information;
            Page _page = (Page)HttpContext.Current.CurrentHandler;
            ScriptManager.RegisterStartupScript(_page, _page.GetType(), "Alert", "<script language='javascript'>generateAlert(\"" + pType + "\",\"<b>Message: </b><br /><br />" + escapeString(pMessage) + "\");</script>", false);
        }

        public static void ShowErrorMessage(UtilException pex)
        {
            Page _page = (Page)HttpContext.Current.CurrentHandler;
            string exceptionsTimeOutServer = "";
            string exceptionsTimeOutWaitingTime = "";
            string pMessage = pex.UserMessage;
            bool isSupport = true;

            if (pex.OriginalException.Message.Contains("System.Data.SqlClient.SqlException: Timeout expired.") ||
                pex.OriginalException.Message.Contains("A transport-level error has occurred when receiving results from the server.") ||
                pex.OriginalException.Message.Contains("A connection was successfully established with the server, but then an error occurred during the pre-login handshake."))
            {
                exceptionsTimeOutServer = GetAppSetting("ExceptionsTimeOutServer");
                exceptionsTimeOutWaitingTime = GetAppSetting("ExceptionsTimeOutWaitingTime");

                pMessage = "The server <b>" + exceptionsTimeOutServer + "</b> not responding, please refresh your page with F5 key in your keyboard and try again.";
                isSupport = false;
            }

            if (pex.OriginalException.Message.Contains("System.Data.SqlClient.SqlException: A network-related or instance-specific error occurred while establishing a connection to SQL Server. The server was not found or was not accessible."))
            {
                exceptionsTimeOutServer = GetAppSetting("ExceptionsTimeOutServer");
                pMessage = "<b>(" + exceptionsTimeOutServer + "</b>) " + "A network-related or instance-specific error occurred while establishing a connection to SQL Server. The server was not found or was not accessible. Verify that the instance name is correct and that SQL Server is configured to allow remote connections.";

                isSupport = false;
            }
            ShowErrorMessage(pMessage, isSupport);
        }

        public static void ShowErrorMessage(string pMessage, bool isSupport)
        {
            Page _page = (Page)HttpContext.Current.CurrentHandler;
            Employee objUser = GetUser();
            String message = escapeString(pMessage);
            String currentDT = DateTime.Now.Ticks + "";
            if (isSupport)
            {
                message = "\"<b>An unexpected error has occurred. Please contact technical support for assistance and provide and snapshot of your screen (search for Snipping Tool <img src='" + baseThemeUrl + "/images/snipping-tool.png' /> in your programs), add as many details as possible and <a href='mailto:FRO Global Automation Solutions Team<dl.fro.global.automation.solutions.team@imcla.lac.nsroot.net>?subject=" + "Talent Tracker Support - [" + objUser.SOEID + "] " + objUser.Name + " - " + currentDT + "&body=" + message + "' >click here to send us the report by email</a>, or you can try to reload this page with F5 key on your keyboard: </b> <br><pre style='text-align: left;'>" + message + "</pre>\"";
            }
            else
            {
                message = "\"" + message + "\"";
            }
            String script = "<script language='javascript'>generateAlert(\"warning\"," + message + ");</script>";
            ScriptManager.RegisterStartupScript(_page, _page.GetType(), "Alert", script, false);
        }

        public static string escapeString(string s)
        {
            if (s == null || s.Length == 0)
            {
                return "";
            }

            char c = '\0';
            int i;
            int len = s.Length;
            System.Text.StringBuilder sb = new System.Text.StringBuilder(len + 4);
            String t;

            for (i = 0; i < len; i += 1)
            {
                c = s[i];
                switch (c)
                {
                    case '\\':
                    case '"':
                        sb.Append('\\');
                        sb.Append(c);
                        break;
                    case '/':
                        sb.Append('\\');
                        sb.Append(c);
                        break;
                    case '\b':
                        sb.Append("\\b");
                        break;
                    case '\t':
                        sb.Append("\\t");
                        break;
                    case '\n':
                        sb.Append("\\n");
                        break;
                    case '\f':
                        sb.Append("\\f");
                        break;
                    case '\r':
                        sb.Append("\\r");
                        break;
                    default:
                        if (c < ' ')
                        {
                            t = "000" + String.Format("X", c);
                            sb.Append("\\u" + t.Substring(t.Length - 4));
                        }
                        else
                        {
                            sb.Append(c);
                        }
                        break;
                }
            }
            return sb.ToString();
        }

        public static void loadPosbackScripts()
        {
            Page _page = (Page)HttpContext.Current.CurrentHandler;
            ScriptManager.RegisterStartupScript(_page, _page.GetType(), "PosbackScripts", "<script language='javascript'>loadPosbackScripts()</script>", false);
        }

        public static String FastSQL(string pSQL, params SqlParameter[] arrParam)
        {
            String result = "";
            SqlConnection conn = null;
            SqlCommand comm = null;
            try
            {
                String LConnectionString = GetConnectionString("ConnString");
                conn = new SqlConnection(LConnectionString);
                comm = new SqlCommand(pSQL, conn);
                conn.Open();

                if (arrParam != null)
                {
                    foreach (SqlParameter param in arrParam)
                    {
                        comm.Parameters.Add(param);
                    }
                }

                SqlDataReader reader = comm.ExecuteReader();
                if (reader.Read())
                {
                    result = reader.GetString(0);
                }
            }
            catch (UtilException uEx)
            {
                uEx.StackTrace.Add((System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name) + " : " + (System.Reflection.MethodBase.GetCurrentMethod().Name));
                uEx.SoeidSession = GetSOEID();
                uEx.SaveExceptionInBD();
                ShowErrorMessage(uEx);
            }
            catch (Exception ex)
            {
                String extraInfo = "\n[SQL]:" + pSQL + " | \n[Params]:";
                foreach (SqlParameter param in arrParam)
                {
                    extraInfo = extraInfo + param.ParameterName + "=" + param.Value + ", ";
                }

                String OriginalExceptionClass = System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name;
                String OriginalExceptionMethod = System.Reflection.MethodBase.GetCurrentMethod().Name;

                UtilException uEx = new UtilException(ex, extraInfo);
                uEx.StackTrace.Add(OriginalExceptionClass + " : " + OriginalExceptionMethod);
                uEx.SoeidSession = GetSOEID();
                uEx.SaveExceptionInBD();
                ShowErrorMessage(uEx);
            }
            finally
            {
                if (comm != null)
                {
                    comm.Dispose();
                }
                if (conn != null)
                {
                    conn.Close();
                }
            }

            return result;
        }

        public static String CreateReportLog(string reportName)
        {
            int appID = 7;
            String pSQL = "EXEC [Automation].[dbo].[proc_Create_ReportLog] " +
                          "     @ApplicationID = " + appID + ", " +
                          "     @ReportName = '" + reportName + "', " +
                          "     @ExecutedBy = '" + GetSOEID() + "' ";
            String result = "";
            String LConnectionString = System.Configuration.ConfigurationManager.ConnectionStrings["ConnString"].ConnectionString;
            SqlConnection conn = new SqlConnection(LConnectionString);
            SqlCommand comm = new SqlCommand(pSQL, conn);
            conn.Open();
            try
            {
                comm.ExecuteNonQuery();
            }
            catch (UtilException uEx)
            {
                uEx.StackTrace.Add((System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name) + " : " + (System.Reflection.MethodBase.GetCurrentMethod().Name));
                uEx.SoeidSession = GetSOEID();
                uEx.SaveExceptionInBD();
                ShowErrorMessage(uEx);
            }
            catch (Exception ex)
            {
                String extraInfo = "\n[SQL]:" + pSQL + " | \n[Params]:";

                String OriginalExceptionClass = System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name;
                String OriginalExceptionMethod = System.Reflection.MethodBase.GetCurrentMethod().Name;

                UtilException uEx = new UtilException(ex, extraInfo);
                uEx.StackTrace.Add(OriginalExceptionClass + " : " + OriginalExceptionMethod);
                uEx.SoeidSession = GetSOEID();
                uEx.SaveExceptionInBD();
                ShowErrorMessage(uEx);
            }
            finally
            {
                comm.Dispose();
                conn.Close();
            }

            return result;
        }

        public static System.Data.DataTable GetDataTableFromExcel(AjaxControlToolkit.AsyncFileUpload pfileUpload, String puploadFolder, String psheetName, String pfileID)
        {
            System.Data.DataTable retval = null;
            try
            {
                if (pfileUpload.HasFile)
                {
                    string userSOEID = GetSOEID();
                    String _path = String.Empty;
                    String _fileName = String.Empty;
                    _fileName = pfileUpload.FileName;

                    //Save file
                    String uploadFolder = GetAppSetting("Upload_Folder");
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
                    uEx.SoeidSession = GetSOEID();
                    uEx.SaveExceptionInBD();

                    System.Web.HttpContext.Current.Session["uploadMessage"] = "Exception: " + uEx.OriginalException.ToString();
                }
            }
            return retval;
        }

        public static System.Data.SqlClient.SqlCommand SQL_GetSPCommand(string sp)
        {
            string connString = GetConnectionString("ConnString");

            // Create connections with the database
            System.Data.SqlClient.SqlConnection conn = new System.Data.SqlClient.SqlConnection(connString);

            // Create a command object identifying the stored procedure
            System.Data.SqlClient.SqlCommand command = new System.Data.SqlClient.SqlCommand(sp, conn);

            // Set the command object so it knows to execute a stored procedure
            command.CommandType = System.Data.CommandType.StoredProcedure;

            return command;
        }

        public static JqxGrid GetJqxGridFromJson(string json)
        {
            return JsonConvert.DeserializeObject<JqxGrid>(json);
        }

        public static string SerializeObject(object pobj)
        {
            return JsonConvert.SerializeObject(pobj);
        }

        public static void loadYears(ref DropDownList pcboYears)
        {
            int currentYear = DateTime.Today.Year;

            //Add 1 back and 5 ahead
            for (int i = currentYear - 1; i < currentYear + 5; i++)
            {
                pcboYears.Items.Add(new ListItem("" + i, "" + i));
            }
        }
    }
}
