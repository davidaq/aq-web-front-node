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
 - Best effort to generate legacy IE compatible JS code
   (will automatically load ES5-Shim and ES5-Sham)
 - Convient get, post, put, delete AJAX method attached to XMLHttpRequest
   (Same usage as get and post methods in jQuery)
 - Easy import for useful JS libraries: lodash, EventEmitter, jQuery
   (React and ReactDOM are automatically imported if when use of JSX exists)
 - Source map gereration for both js and css artifacts
 - Every piece of code will be called when the DOM is ready

Directory Structure
-------------------

This is just an example of how things can work, actual usage may vary.

    Project Root --+-- app/ -----------+-- ClassA.js
                   |                   |
                   +-- @ app.js        +-- ClassB/ ---------+-- index.js
                   |                   |                    |
                   +-- @ app.js.map    +-- @ _build/        +-- View.jsx
                   |                   |                    |
                   +-- @ app.css       +-- other sources    +-- Style.styl
                   |
                   +-- @ app.css.map
                   |
                   +-- index.html (or other AWF unrelated files)

 - Items marked "*" are generated by this framework
 - As described in the usage description, 
   the names of app.* or app.*.map files will follow the name of app directory
 - _build directory is used for caching, deleting will cause a full recompile.
   *PLEASE KEEP THIS DIRECTORY ALONE*, do not put anything useful in here.

Examples
--------

Document needs further completion.

=== Basic usage

=== ES2015

=== Module import

=== JSX classes

=== Stylus integration

=== XMLHttpRequest

=== lodash and EventEmitter and jQuery

=== A full working example: Grocery list
