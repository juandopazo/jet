YAHOO.env.classMap = {"Paginator": "paginator", "NodeList": "node", "DOM": "node", "Tween": "anim", "SimpleDialog": "container", "DataSource.Local": "datasource", "Vector.Text": "vector", "Utility": "base", "Vector.Line": "vector", "utils.Mouse": "base", "Node": "treeview", "Core": "jet", "Widget": "base", "Hash": "jet", "jet": "jet", "DataSource.Get": "datasource", "Vector.Rectangle": "vector", "DataSource.XDR": "datasource", "Overlay": "container", "JSON": "json", "Drag": "dragdrop", "Base": "base", "Cookie": "cookie", "DragDrop": "dragdrop", "TimeFrame": "anim", "Vector.Ellipse": "vector", "OOP": "base", "Resize": "resize", "ImageLoader": "imageloader", "Lang": "jet", "DataSource.Ajax": "datasource", "VectorView": "vector", "RecordSet": "datasource", "Button": "button", "EventCache": "node", "EventTarget": "base", "Record": "datasource", "RadioButton": "button", "Vector": "vector", "Vector.Circle": "vector", "IO": "io", "Easing": "anim", "DataTable": "datatable", "History": "history", "Vector.RoundedRectangle": "vector", "TreeView": "treeview", "TabView": "tabs", "Vector.Path": "vector", "Attribute": "base", "Image": "imageloader", "Get": "jet", "Module": "container", "Vector.Image": "vector", "DataSource": "datasource", "Tab": "tabs", "ComboBox": "button", "Array": "jet", "Panel": "container", "UA": "ua", "SimpleProgressBar": "simpleprogressbar"};

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
