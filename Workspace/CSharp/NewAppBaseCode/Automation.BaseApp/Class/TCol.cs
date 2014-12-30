using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Automation.BaseApp.Class
{
    public class TCol
    {
        public string id { get; set; }
        public string colHeaderTitle { get; set; }
        public string colWidth { get; set; }
        public string colValue { get; set; }
        public string colDbToBind { get; set; }
        public string typeEditField { get; set; }
        public string colTextAlign { get; set; }
        public string canEdit { get; set; }
        public string canFilter { get; set; }
        public string hideCol { get; set; }
        public string cellTemplate { get; set; }
        public TSelect select { get; set; }
    }
}
