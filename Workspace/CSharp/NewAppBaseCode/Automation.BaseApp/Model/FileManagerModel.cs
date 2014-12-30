using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Reflection;
using System.Text;
using Automation.BaseApp.Class;

namespace Automation.BaseApp.Model
{
    public class FileManagerModel
    {
        private ErrorUtil ErrorUtil = new ErrorUtil();

        public void uploadFile(DataTable pdataExcel, String psoeid, String pfileID, String pspName, String pyear, String pmonth)
        {
            try
            {
                // Create connections with the database
                string connString = SessionUtil.GetConnectionString("ConnString");
                System.Data.SqlClient.SqlConnection conn = new System.Data.SqlClient.SqlConnection(connString);

                // Create a command object identifying the stored procedure
                System.Data.SqlClient.SqlCommand _command = new System.Data.SqlClient.SqlCommand(pspName, conn);

                // Set the command object so it knows to execute a stored procedure
                _command.CommandType = System.Data.CommandType.StoredProcedure;
                _command.CommandTimeout = 999999999;
                
                SqlParameter _table = new SqlParameter("@EXCELTABLE", SqlDbType.Structured);
                _table.Value = pdataExcel;
                _command.Parameters.Add(_table);

                SqlParameter _soeid = new SqlParameter("@SOEID_UPLOADER", SqlDbType.VarChar);
                _soeid.Value = psoeid;
                _command.Parameters.Add(_soeid);

                SqlParameter _fileID = new SqlParameter("@FILE_ID", SqlDbType.VarChar);
                _fileID.Value = pfileID;
                _command.Parameters.Add(_fileID);

                SqlParameter _year = new SqlParameter("@YEAR", SqlDbType.VarChar);
                _year.Value = pyear;
                _command.Parameters.Add(_year);

                SqlParameter _month = new SqlParameter("@MONTH", SqlDbType.VarChar);
                _month.Value = pmonth;
                _command.Parameters.Add(_month);

                // Execute the command
                conn.Open();

                _command.ExecuteNonQuery();

                conn.Close();
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
    }
}
