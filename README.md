#jet(): JavaScript Extension Toolkit

Jet is a JavaScript UI toolkit based on two premises:

* Lower compatibility but small size and great performance
* Not every feature out-of-the-box but great scalability

## Compatibility
Jet is currently a one-man project. Given these limited resources, it is only tested against IE 6, 7 and 8, and the latest versions of Firefox, Chrome, Safari and Opera. Older versions and other browsers aren't guaranteed to work at all. The goal of this project is experimentation and learning, so feel free to use any part of Jet in your projects at your own risk.

The status of the library is *under development*, not even an alpha stage. And since it is a learning project, you are very much welcome to provide suggestions, code and graphic design.

## Small size
There are many great JavaScript UI libraries out there. Most favor a long range of compatibility and heavy features. That's great when you need a lot of features and have lots of users in the long tail of the browser market. However, most of the time it ends up being overkill or, if you are a UI developer, you end up working on top of a lot of code you don't use.

With that in mind, Jet aims at having a small and powerful core under *15 Kb minified* (5 Kb with gzip compression) that provides a good DOM interface, lots of *optional features* and a good architecture based on Yahoo!'s YUI 3 that will allow you to write good easy-to-maintain code on top of it.

## Modules
Jet comes with a lot of optional modules that you can load dinamically. The complete documentation is available in the API reference: http://www.juandopazo.com.ar/jet/api/

###Included in the Jet Core
* **Get** dynamically load scripts and CSS files
* **IO** for your XmlHttpRequest needs
* **Lang** type determining functions, and utilities for working with Arrays and Hashes
* **Log** logging tools, for later watching from the [[Log Console]
* **Node** chainable and powerful DOM interface
* **UA** browser sniffing

###Utilities
* **Anim** plugs animations into Node and provides a TimeFrame and Tweens for more complex animations
* **Cookie** easy to use cookies
* **History** ReallySimpleHistory project adapted to jet() and updated for modern browsers
* **ImageLoader** preload images, show them only when needed and fix PNG's
* ***io-xdr** asynchronous cross-domain calls based on flash
* ***io-xsl** for loading and using XSL transformations
* **DataSource** transform one information source into the schema your application uses
* **DragDrop** some times the drag metaphor just works
* ***JSON** Douglas Crockford's JSON module. Loads only if the browser doesn't have native JSON support
* **Resize** resize elements
* ***Sizzle** John Resig's CSS selector engine
* ***SWF** SWFObject as a module
* **Vector** provides cross-browser SVG support (using VML in Internet Explorer) for drawing graphics

###Widgets
* **Button** Button, ComboBox, RadioButton
* **Container** Module, Overlay, Panel, SimpleDialog for creating dynamic windows and forms
* **DataTable** sortable table plugged into a DataSource for easily displaying lots of data
* **Paginator** switch between virtual pages of data, based on a DataSource
* **SimpleProgressBar** for when you need to load a lot of modules
* **Tabs** simple tabs, progressive-enhancement ready
* **TreeView** generic tree building tool
  