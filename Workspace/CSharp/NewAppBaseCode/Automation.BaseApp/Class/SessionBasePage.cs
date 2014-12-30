using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Automation.BaseApp.Class
{
    /// <summary>
    /// Programmer: Carlos Dominguez
    /// Date: 11 Nov 2014
    /// Description: Base class for all the .ASPX pages

    public class SessionBasePage : System.Web.UI.Page
    {
        public void pageLoad()
        {
            //Return default value "sessionWasRefreshed"
            SessionUtil.sessionWasRefreshed = false;

            //Always refresh current soeid
            string current_soeid = SessionUtil.GetSOEID();
        }
    }
}
