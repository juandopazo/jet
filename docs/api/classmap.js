YAHOO.env.classMap = {"Paginator": "paginator", "NodeList": "node", "DOM": "node", "SimpleDialog": "container", "DataSource.Local": "datasource", "Vector.Text": "vector", "Utility": "base", "Vector.Line": "vector", "utils.Mouse": "base", "Core": "jet", "Widget": "base", "Hash": "jet", "jet": "jet", "DataSource.Get": "datasource", "Vector.Rectangle": "vector", "Overlay": "container", "JSON": "json", "Drag": "dragdrop", "Base": "base", "Cookie": "cookie", "ImageLoader": "imageloader", "Vector.Image": "vector", "OOP": "base", "Resize": "resize", "DragDrop": "dragdrop", "Lang": "jet", "DataSource.Ajax": "datasource", "VectorView": "vector", "RecordSet": "datasource", "Button": "container", "EventCache": "node", "EventTarget": "base", "Record": "datasource", "Vector": "vector", "Vector.Circle": "vector", "IO": "io", "DataTable": "datatable", "Vector.RoundedRectangle": "vector", "Vector.Ellipse": "vector", "Vector.Path": "vector", "Attribute": "base", "Image": "imageloader", "Get": "jet", "Module": "container", "DataSource": "datasource", "Array": "jet", "Panel": "container", "UA": "ua", "SimpleProgressBar": "simple-progressbar"};

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
