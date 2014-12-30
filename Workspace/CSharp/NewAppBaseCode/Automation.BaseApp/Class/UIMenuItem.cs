using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Automation.BaseApp.Class
{
    public class UIMenuItem
    {
        public String Url { get; set; }
        public String Title { get; set; }
        public String Text { get; set; }
        public Boolean IsTargetBlank { get; set; }
        public List<UIMenuItem> Nodes { get; set; }

        public UIMenuItem() { }

        public UIMenuItem(String purl, String ptitle, String ptext)
        {
            Url = purl;
            Title = ptitle;
            Text = ptext;
        }
    }
}
