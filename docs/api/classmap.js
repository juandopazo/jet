YAHOO.env.classMap = {"NodeList": "node", "DOM": "node", "SimpleDialog": "container", "DataSource.Local": "datasource", "utils.Mouse": "base", "Core": "jet", "Widget": "base", "Hash": "jet", "jet": "jet", "DataSource.Get": "datasource", "Overlay": "container", "Drag": "dragdrop", "Base": "base", "Cookie": "cookie", "DragDrop": "dragdrop", "OOP": "base", "Lang": "jet", "DataSource.Ajax": "datasource", "RecordSet": "datasource", "Button": "container", "EventCache": "node", "EventTarget": "base", "Record": "datasource", "IO": "io", "DataTable": "datatable", "Attribute": "base", "Get": "jet", "Module": "container", "DataSource": "datasource", "Array": "jet", "Panel": "container", "UA": "ua", "Utility": "base"};

YAHOO.env.resolveClass = function(className) {
    var a=className.split('.'), ns=YAHOO.env.classMap;

    for (var i=0; i<a.length; i=i+1) {
        if (ns[a[i]]) {
            ns = ns[a[i]];
        } else {
            return null;
        }
    }

    return ns;
};
