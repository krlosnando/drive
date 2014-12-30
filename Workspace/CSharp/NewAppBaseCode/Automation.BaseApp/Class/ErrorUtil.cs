using System;
using System.IO;
using System.Reflection;
using System.Configuration;

/// <summary>
/// Programmer: Carlos Dominguez
/// Date: Monday, October 07, 2013
/// Description: Class to control the errors of the application
/// Modify by: Carlos Dominguez
/// Date of last modified: Monday, October 07, 2013
/// Comments:
/// </summary>
/// <remarks></remarks>
namespace Automation.BaseApp.Class

{
    public class ErrorUtil
    {

        #region "Variables"

        private string _id;
        private DateTime _errorDate;
        private string _method;

        private string _description;
        #endregion

        #region "Properties"

        public string Id
        {
            get { return _id; }
            set { _id = value; }
        }

        public DateTime ErrorDate
        {
            get { return _errorDate; }
            set { _errorDate = value; }
        }

        public string Method
        {
            get { return _method; }
            set { _method = value; }
        }

        public string Description
        {
            get { return _description; }
            set { _description = value; }
        }
        #endregion

        #region "Methods"

        /// <summary>
        /// Class constructor
        /// </summary>
        /// <remarks></remarks>
        public ErrorUtil()
        {
            Id = string.Empty;
            ErrorDate = DateTime.Now;
            Method = string.Empty;
            Description = string.Empty;
        }

        /// <summary>
        /// Write to database and send a Email
        /// </summary>
        /// <param name="pMethod"></param>
        /// <param name="pDescription"></param>
        /// <remarks></remarks>
        public string WriteError(string psoeidSession, string pmethod, string pexception)
        {
            try
            {
                Id = InsertExceptionDB(psoeidSession, pmethod, pexception);
                return "Error number: " + Id + ".";
            }
            catch (Exception)
            {
                throw;
            }
        }

        public string WriteError(string pmethod, string pexception)
        {
            try
            {
                Id = InsertExceptionDB("[NO]", pmethod, pexception);
                return "Error number: " + Id + ".";
            }
            catch (Exception)
            {
                throw;
            }
        }

        public string InsertExceptionDB(string psoeidSession, string pmethod, string pexception)
        {
            try
            {
                System.Data.SqlClient.SqlDataReader rdr = null;
                string _idException = "[PENDING]";

                string emailTo = SessionUtil.GetAppSetting("ExceptionsEmailTo");
                string connString = SessionUtil.GetConnectionString("ConnString");
                string procName = SessionUtil.GetAppSetting("ExceptionsProcName");
                
                // Create a command object identifying the stored procedure
                System.Data.SqlClient.SqlCommand command = SessionUtil.SQL_GetSPCommand(procName);

                // Add parameter to command, which will be passed to the stored procedure
                command.Parameters.Add(new System.Data.SqlClient.SqlParameter("@SOE_ID_SESSION", psoeidSession));
                command.Parameters.Add(new System.Data.SqlClient.SqlParameter("@METHOD", pmethod));
                command.Parameters.Add(new System.Data.SqlClient.SqlParameter("@EXCEPTION", pexception));
                command.Parameters.Add(new System.Data.SqlClient.SqlParameter("@EMAIL_TO", emailTo));

                // Execute the command
                command.Connection.Open();
                rdr = command.ExecuteReader();
                
                while (rdr.Read())
                {
                    _idException = rdr["ID_EXCEPTION"].ToString();
                }

                command.Connection.Close();
                return _idException;
            }
            catch (Exception)
            {
                throw;
            }
        }
        #endregion

    }
}
