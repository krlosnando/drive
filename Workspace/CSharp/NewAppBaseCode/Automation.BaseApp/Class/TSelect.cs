using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Automation.BaseApp.Class
{
    public class TSelect
    {
        public string spName { get; set; }
        public List<Dictionary<string, string>> spParams { get; set; }
        public List<Dictionary<string, string>> spColumnsToSelect { get; set; }
        public Dictionary<string, string> selectAttrs { get; set; }
        public Dictionary<string, string> optionAttrs { get; set; }
        public Dictionary<string, string> defaultOption { get; set; }
    }
}
