
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;
using Microsoft.Practices.EnterpriseLibrary.Data;
using System.Data.Common;
using Automation.BaseApp.Class;
using System.Data.SqlClient;

namespace Automation.BaseApp.Model
{
    public class BaseAppModel
    {
        public List<Dictionary<string, string>> getResultList(string pspDB, List<Dictionary<string, string>> pspDBParmas, List<Dictionary<string, string>> pcolsToSelect)
        {
            var resultList = new List<Dictionary<string, string>>();
            try
            {
                SqlCommand comm = SessionUtil.SQL_GetSPCommand(pspDB);

                if (pspDBParmas != null)
                {
                    foreach (var item in pspDBParmas)
                    {
                        comm.Parameters.Add(new SqlParameter(item["Name"], item["Value"]));
                    }
                }

                comm.Connection.Open();
                System.Data.SqlClient.SqlDataReader rdr = comm.ExecuteReader();

                while (rdr.Read())
                {
                    var rowData = new Dictionary<String, String>();

                    //Add columns information
                    foreach (var item in pcolsToSelect)
                    {
                        rowData.Add(item["Name"], rdr[item["Name"]].ToString());
                    }
                    resultList.Add(rowData);
                }

                comm.Connection.Close();
            }
            catch (UtilException uEx)
            {
                String extraInfo = "\n[SQL]:EXEC " + pspDB + " | \n[Params]:";
                extraInfo += "================================\n";

                foreach (var item in pspDBParmas)
                {
                    extraInfo += item["Name"] + ": [" + item["Value"] + "]\n";
                }

                uEx.StackTrace.Add((System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name) + " : " + (System.Reflection.MethodBase.GetCurrentMethod().Name) + ": " + extraInfo);
                throw uEx;
            }
            catch (Exception ex)
            {
                String extraInfo = "\n[SQL]:EXEC " + pspDB + " | \n[Params]:";
                extraInfo += "================================\n";

                if (pspDBParmas != null)
                {
                    foreach (var item in pspDBParmas)
                    {
                        extraInfo += item["Name"] + ": [" + item["Value"] + "]\n";
                    }
                }
                
                UtilException uEx = new UtilException(ex);
                uEx.OriginalExceptionClass = System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name;
                uEx.OriginalExceptionMethod = System.Reflection.MethodBase.GetCurrentMethod().Name;
                uEx.StackTrace.Add(uEx.OriginalExceptionClass + " : " + uEx.OriginalExceptionMethod + ": " + extraInfo);
                throw uEx;
            }
            return resultList; 
        }

        public Dictionary<string, string> insertNew(string spDBInsert, List<Dictionary<string, string>> spDBInsertParams, List<Dictionary<string, string>> colsDBToSelect)
        {
            Dictionary<string, string> newObjectData = new Dictionary<string, string>();
            try
            {
                DataSet ds = null;
                Database db = DatabaseFactory.CreateDatabase();
                DbCommand comm = db.GetStoredProcCommand(spDBInsert);

                foreach (var item in spDBInsertParams)
                {
                    db.AddInParameter(comm, item["Name"], DbType.String, item["Value"]);
                }

                ds = db.ExecuteDataSet(comm);

                if ((ds != null))
                {
                    if (ds.Tables.Count >= 1)
                    {
                        DataTable objTable = ds.Tables[0];

                        for (int _i = 0; _i <= objTable.Rows.Count - 1; _i++)
                        {
                            //Add atributes information
                            foreach (var item in colsDBToSelect)
                            {
                                if (item.ContainsKey("Name"))
                                {
                                    newObjectData.Add(item["Name"], objTable.Rows[_i][item["Name"]].ToString());
                                }
                            }
                        }
                    }
                }
                else
                {
                    return null;
                }
            }
            catch (UtilException uEx)
            {
                String extraInfo = "\n[SQL]:EXEC " + spDBInsert + " | \n[Params]:";
                extraInfo += "================================\n";

                foreach (var item in spDBInsertParams)
                {
                    extraInfo += item["Name"] + ": [" + item["Value"] + "]\n";
                }

                uEx.StackTrace.Add((System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name) + " : " + (System.Reflection.MethodBase.GetCurrentMethod().Name) + ": " + extraInfo);
                throw uEx;
            }
            catch (Exception ex)
            {
                String extraInfo = "\n[SQL]:EXEC " + spDBInsert + " | \n[Params]:";
                extraInfo += "================================\n";

                foreach (var item in spDBInsertParams)
                {
                    extraInfo += item["Name"] + ": [" + item["Value"] + "]\n";
                }

                UtilException uEx = new UtilException(ex);
                uEx.OriginalExceptionClass = System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name;
                uEx.OriginalExceptionMethod = System.Reflection.MethodBase.GetCurrentMethod().Name;
                uEx.StackTrace.Add(uEx.OriginalExceptionClass + " : " + uEx.OriginalExceptionMethod + ": " + extraInfo);
                throw uEx;
            }
            return newObjectData; 
        }

        public string deleteRow(string spDBDelete, List<Dictionary<string, string>> spDBToDeleteParams)
        {
            string message = "Row was deleted successful";
            try
            {
                DataSet ds = null;
                Database db = DatabaseFactory.CreateDatabase();
                DbCommand comm = db.GetStoredProcCommand(spDBDelete);

                foreach (var item in spDBToDeleteParams)
                {
                    db.AddInParameter(comm, item["Name"], DbType.String, item["Value"]);
                }

                ds = db.ExecuteDataSet(comm);

            }
            catch (UtilException uEx)
            {
                String extraInfo = "\n[SQL]:EXEC " + spDBDelete + " | \n[Params]:";
                extraInfo += "================================\n";

                foreach (var item in spDBToDeleteParams)
                {
                    extraInfo += item["Name"] + ": [" + item["Value"] + "]\n";
                }

                uEx.StackTrace.Add((System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name) + " : " + (System.Reflection.MethodBase.GetCurrentMethod().Name) + ": " + extraInfo);
                message = uEx.GetMessage();
                throw uEx;
            }
            catch (Exception ex)
            {
                String extraInfo = "\n[SQL]:EXEC " + spDBDelete + " | \n[Params]:";
                extraInfo += "================================\n";

                foreach (var item in spDBToDeleteParams)
                {
                    extraInfo += item["Name"] + ": [" + item["Value"] + "]\n";
                }

                UtilException uEx = new UtilException(ex);
                uEx.OriginalExceptionClass = System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name;
                uEx.OriginalExceptionMethod = System.Reflection.MethodBase.GetCurrentMethod().Name;
                uEx.StackTrace.Add(uEx.OriginalExceptionClass + " : " + uEx.OriginalExceptionMethod + ": " + extraInfo);
                message = uEx.GetMessage();
                throw uEx;
            }
            return message; 
        }

        public string saveRow(string spDBEdit, List<Dictionary<string, string>> spDBToEditParams)
        {
            string message = "Row was saved successful";
            try
            {
                DataSet ds = null;
                Database db = DatabaseFactory.CreateDatabase();
                DbCommand comm = db.GetStoredProcCommand(spDBEdit);

                foreach (var item in spDBToEditParams)
                {
                    db.AddInParameter(comm, item["Name"], DbType.String, item["Value"]);
                }

                ds = db.ExecuteDataSet(comm);

            }
            catch (UtilException uEx)
            {
                String extraInfo = "\n[SQL]:EXEC " + spDBEdit + " | \n[Params]:";
                extraInfo += "================================\n";

                foreach (var item in spDBToEditParams)
                {
                    extraInfo += item["Name"] + ": [" + item["Value"] + "]\n";
                }

                uEx.StackTrace.Add((System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name) + " : " + (System.Reflection.MethodBase.GetCurrentMethod().Name) + ": " + extraInfo);
                message = uEx.GetMessage();
                throw uEx;
            }
            catch (Exception ex)
            {
                String extraInfo = "\n[SQL]:EXEC " + spDBEdit + " | \n[Params]:";
                extraInfo += "================================\n";

                foreach (var item in spDBToEditParams)
                {
                    extraInfo += item["Name"] + ": [" + item["Value"] + "]\n";
                }

                UtilException uEx = new UtilException(ex);
                uEx.OriginalExceptionClass = System.Reflection.MethodBase.GetCurrentMethod().DeclaringType.Name;
                uEx.OriginalExceptionMethod = System.Reflection.MethodBase.GetCurrentMethod().Name;
                uEx.StackTrace.Add(uEx.OriginalExceptionClass + " : " + uEx.OriginalExceptionMethod + ": " + extraInfo);
                message = uEx.GetMessage();
                throw uEx;
            }
            return message; 
        }
    }
}
