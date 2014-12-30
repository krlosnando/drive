using System;
using System.Collections.Generic;

/// <summary>
/// Programmer: Carlos Dominguez
/// Date: Monday, November 25, 2013
/// Description: Class to create Util Exceptions
/// Modify by:
/// Date of last modified:
/// Comments:
/// </summary>
/// <remarks></remarks>
namespace Automation.BaseApp.Class
{
    public class UtilException : System.Exception
    {
        public static ErrorUtil ErrorUtil = new ErrorUtil();

        public List<String> StackTrace = new List<String>();
        public String UserMessage { get; set; }
        public String OriginalExceptionMethod { get; set; }
        public String OriginalExceptionClass { get; set; }
        public String OriginalExceptionMessage { get; set; }
        public Exception OriginalException { get; set; }
        public String SoeidSession { get; set; }
        public bool IsCustomSQLException = false;

        public UtilException(Exception pException)
        {
            OriginalException = pException;
            OriginalExceptionMessage = pException.ToString();
            validateSQLException(pException);
        }

        public UtilException(Exception pException, String pextraInfo)
        {
            OriginalException = pException;
            OriginalExceptionMessage = "[ExtraInfo]: " + pextraInfo + " | \n[OriginalException]:\n" + pException.ToString();
            validateSQLException(pException);
        }

        public String GetMessage()
        {
            String message = OriginalExceptionMessage + " | \n[StackTrace]:";
            for (int i = 0; i < StackTrace.Count; i++)
            {
                message += "\n{" + i + "}:" + StackTrace[i];
            }

            return message;
        }

        public void SaveExceptionInBD()
        {
            try
            {
                if (!IsCustomSQLException)
                {
                    if (!String.IsNullOrEmpty(SoeidSession))
                    {
                        UserMessage = ErrorUtil.WriteError(SoeidSession, OriginalExceptionClass + " : " + OriginalExceptionMethod, GetMessage());
                    }
                    else
                    {
                        UserMessage = ErrorUtil.WriteError(OriginalExceptionClass + " : " + OriginalExceptionMethod, GetMessage());
                    }
                }
            }
            catch (Exception ex)
            {
                UserMessage = "Exception can be saved by the follow error: \n" + ex.ToString();
            }
        }

        private void validateSQLException(Exception pException)
        {
            if (pException != null && pException.GetType().Name == "SqlException")
            {
                var sqlException = (System.Data.SqlClient.SqlException)pException;

                //Custom exception from database
                if (sqlException.Class == 11)
                {
                    IsCustomSQLException = true;
                    UserMessage = sqlException.Message;
                }
                else
                {
                    OriginalExceptionMessage += "\n[SQLException]: ";
                    OriginalExceptionMessage += "\n | [Message]:" + sqlException.Message;
                    OriginalExceptionMessage += "\n | [Class]:" + sqlException.Class;
                    OriginalExceptionMessage += "\n | [LineNumber]:" + sqlException.LineNumber;
                    OriginalExceptionMessage += "\n | [Number]:" + sqlException.Number;
                    OriginalExceptionMessage += "\n | [Procedure]:" + sqlException.Procedure;
                    OriginalExceptionMessage += "\n | [Server]:" + sqlException.Server;
                    OriginalExceptionMessage += "\n | [Source]:" + sqlException.Source;
                    OriginalExceptionMessage += "\n | [State]:" + sqlException.State;
                }
            }
        }

    }
}