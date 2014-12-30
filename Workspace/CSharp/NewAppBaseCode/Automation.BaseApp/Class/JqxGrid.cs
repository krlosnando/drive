using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Automation.BaseApp.Class
{
    public class JqxGrid
    {
        public string showTo { get; set; }
        public JqxSp sp { get; set; }
        public List<Dictionary<string, string>> columns { get; set; }
        public string url { get; set; }
        public string width { get; set; }
    }
}
