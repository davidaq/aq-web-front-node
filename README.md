AQ Web Front
============

A compilation framework to allow coding web frontends in a modern style.

Integration of some of the currently best frontend frameworks: Babel, React and Stylus.

Installation
------------

    npm install -g aq-web-front

Usage
-----

    cd 'Project Root/.../app'
    awf

Running `awf` will start watching changes in the `app` directory, and generate
the following files in parent directory: app.js, app.js.map, app.css, app.css.map.

Note: The name of the generated files will be the same as the watched directory. 
i.e. you may watch in `home` directory, and generated files will be home.js etc.

Features
--------

 - ES2015 provided by Babel (not including features requiring pollyfill)
 - CSS preprocessing provided by Stylus (nib import allowed)
 - Merge source files according to imports
 - Babel plugins providing best effort to generate IE8 compatible JS code 
   (will automatically load ES5-Shim and ES5-Sham)
 - IE6 compatible XMLHttpRequest
 - Convient get, post, put, delete AJAX method attached to XMLHttpRequest
   (Same usage as jQuery)
 - Easy import for useful JS libraries: lodash, EventEmitter, jQuery
   (React and ReactDOM are automatically imported if when use of JSX exists)
 - Source map gereration for both js and css artifacts providing easy debugging

Details
-------

Further documentation to be continued...
