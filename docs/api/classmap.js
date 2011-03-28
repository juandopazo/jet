YAHOO.env.classMap = {"Paginator": "paginator", "StaticPanel": "container", "CheckBox": "button", "Layout": "layout", "IO": "io", "DOM": "node", "Menu": "menu", "NodeList": "node", "Cell": "datatable", "ComboOption": "button", "DataSource.Local": "datasource", "CheckBoxGroup": "button", "Vector.Text": "vector", "WidgetParent": "widget-parentchild", "Vector.Line": "vector", "LayoutPanelBase": "layout", "Log": "log", "Core": "io", "Widget": "base", "Hash": "io", "jet": "io", "DataSource.Get": "datasource", "Vector.Rectangle": "vector", "DataSource.XDR": "datasource", "UA": "io", "Overlay": "container", "JSON": "json", "RecordSet": "datasource", "Drag": "dragdrop", "Base": "base", "Cookie": "cookie", "DragDrop": "dragdrop", "TimeFrame": "anim", "WidgetAlignment": "widget-alignment", "ToggleButton": "button", "OOP": "base", "Resize": "resize", "ImageLoader": "imageloader", "Lang": "io", "DataSource.Ajax": "datasource", "TreeNode": "treeview", "WidgetStack": "widget-stack", "Column": "datatable", "Vector.Path": "vector", "Button": "button", "LayoutPanel": "layout", "EventCache": "node", "EventTarget": "base", "PanelBase": "container", "RadioButton": "button", "Vector": "vector", "Vector.Circle": "vector", "Tooltip": "container", "ButtonGroup": "button", "SimpleDialog": "container", "Easing": "anim", "DataTable": "datatable", "History": "history", "Vector.Ellipse": "vector", "Tween": "anim", "WidgetChild": "widget-parentchild", "TreeView": "treeview", "TabView": "tabview", "Record": "datasource", "VectorView": "vector", "Attribute": "base", "Frame": "widget-sandbox", "Get": "io", "Sandbox": "widget-sandbox", "Module": "container", "ProgressBar": "progressbar", "Vector.Image": "vector", "Vector.RoundedRectangle": "vector", "DataSource": "datasource", "Tab": "tabview", "ComboBox": "button", "MenuItem": "menu", "RadioGroup": "button", "Array": "io", "Panel": "container", "Mouse": "base", "Image": "imageloader", "Utility": "base"};

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
