AQ Web Front
============

AWF is a compilation framework to allow coding web frontends in a modern style.

Integration of some of the currently best frontend frameworks: Babel, React and Stylus.

 - [Features](#features)
 - [Installation](#installation)
 - [Usage](#usage)
 - [Directory Structure](#directory-structure)
 - [Configuration](#configuration)
 - [Examples](#examples)
 - [Caveat](#caveat)

Features
--------

 - ES2015 provided by Babel (not including features requiring pollyfill)
 - CSS preprocessing provided by Stylus (nib import allowed)
 - Merge source files according to imports
 - Best effort to generate legacy IE compatible JS code
   (will automatically load ES5-Shim and ES5-Sham)
 - Convient get, post, put, delete AJAX method attached to XMLHttpRequest
   (Same usage as get and post methods in jQuery)
 - Easy import for popular JS libraries: lodash, EventEmitter, jQuery and more
   (React and ReactDOM are automatically imported if when use of JSX exists)
 - Source map gereration for both js and css artifacts
 - Every piece of code will be called when the DOM is ready

Installation
------------

    npm install -g aq-web-front

Usage
-----

Initialize project directory, generate a configuration file:

    $> cd 'Project Root/'
    $> mkdir app
    $> cd app
    $> awf init
    
Begin auto progressive build:
    
    $> cd 'Project Root/app'
    $> awf

Running `awf` will start watching changes in the `app` directory, and generate the 
following files in `Project Root/`: app.js, app.css.

**TIP:** 

 - The name of the generated files will be the same as the watched directory. 
   i.e. watching in `home` directory will generate home.js and home.css.
 - Although you have to run `awf init` right at the directory where source files are 
   watched, running `awf` is not required to be so. You may run it anywhere, and the 
   framework will scan child directories in search of configuration files, or traverse
   up the directory tree if none were found. Watching will start at where existing 
   configuration files were found.

Directory Structure
-------------------

This is just an example of how things might work, actual usage may vary.

    Project Root/ --+-- app/ -----------+-- awf.conf
                    |                   |
                    +-- @ app.js        +-- ClassA/ ---------+-- index.js
                    |                   |                    |
                    +-- @ app.css       +-- ClassB.js        +-- View.jsx
                    |                   |                    |
                    |                   +-- other sources    +-- Style.styl
                    |                   |
                    |                   +-- @ _build/
                    |
                    +-- index.html (or other AWF unrelated files)

**TIP:** 

 - Items marked `@` are generated by this framework
 - As described in the usage description, 
   the names of `app.js` and `app.css` will follow the name of `app` directory
 - `_build` directory is used for storing progressive compile cache and source maps. 
   You may change this to another name by editing the configuration file.
 - Delete `_build` directory if you want a full and clean recompile.
 - You may want to add `_build/` into your `.gitignore` or other version control ignore
   files to keep repo clean.

Configuration
-------------

Configuration is required before building. By calling `awf init`, a configuration file
named `awf.conf` is generated in the current directory. By default, `awf init` will take 
you through some steps to setup the initial preferences. You may call `awf init --default`
or `awf init -d` to generate a configuration file with all default values.

A configuration file is basically a [YAML](http://www.yaml.org) file contain these setups:

 - Debug mode `true`: when off, source maps will not be gernerated and all non-error console 
      outputs will be hidden. When on, debug versions of external libraries will be loaded 
      if available.
 - Build Directory `_build`: where compile caches and source maps are stored.
 - External libraries `non-inline cdnjs`: libraries that you may import, providing it's url 
      and whether it should be inlined. Inlining a library means that the content of the 
      script will be written directly into the generated artifact rather than loading it 
      during runtime.

Examples
--------

 - [Basic Usage](#basic-usage)
 - [ES2015](#es2015)
 - [Module import and export](#module-import-and-export)
 - [JSX classes](#jsx-classes)
 - [Stylus integration](#stylus-integration)
 - [XMLHttpRequest](#xmlhttprequest)
 - [EventEmitter](#eventemitter)
 - [lodash, jQuery, and more](#lodash-jquery-and-more)
 - [A fully working example: Grocery list](#a-fully-working-example-grocery-list)

#### Basic usage

*index.html*

    <!DOCTYPE html>
    <html>
      <head>
        <title>AWF Basic Usage</title>
        <link href="app.css" rel="stylesheet" type="text/css"/>
        <script src="app.js" type="text/javascript"></script>
      </head>
      <body>
      </body>
    </html>

*app/BasicUsage.js*

    console.log('It works');                                // output to console
    ReactDOM.render(<div>It works</div>, document.body);    // output to DOM

**Note:**

 - `document.body` will be available in all popular browsers including IE6
 - React deprecates rendering to document.body, but if you didn't receive a warning message, 
   you're probably not in debug mode. Debug mode can be toggled by editing configuration file.
 - When you debug mode, source maps will allow you to be able to trace where the console outputs
   are located in the source files. Some browsers (such as safari) will cache source map files, 
   and may require manual clean up.

#### ES2015

*app/ES2015.js*

    // class definition and inheritance
    class A {
        whoAmI() {
            return 'A';
        }
    }
    class B extends A {
        whoAmI() {
            return 'B : ' + super.whoAmI();
        }
    }
    var b = new B();
    console.log(b.whoAmI()); //$> B : A
    
    // for of iteration (AWF fixed this feature to make it compatible with IE6)
    var str = '';
    for (var num of [5, 4, 3, 2, 1]) {
        str += num + ' - ';
    }
    console.log(str); //$> 5 - 4 - 3 - 2 - 1 -
    
    // function argument default values
    function add(a, b=1) {
        return a + b;
    }
    console.log(add(2, add(1))); //$> 4
    
This is an example of how you can use some of the language features specified in EcmaScript 6.
For more information checkout the [learn ES2015](http://babeljs.io/docs/learn-es2015/) section
of the [Babel](http://babeljs.io/) project.

Please beware that features requiring pollyfill will not be resolved automatically.
To use them, you must manually load the scripts required, but in this case AWF will not be 
responsible for compatibility issues on legacy browsers.

#### Module import and export

*app/A.js*

    class A { // symbol with the same name of the source file is exported by default
        whoAmI() {
            return 'A';
        }
    }
    
*app/B/index.js* <sub>(when named as index, this module is imported as directory path, i.e. 'B')</sub>
    
    import '../A'; // will be parsed as `import A from '../A';`
    
    export default ClassB extends A {
        whoAmI() {
            return 'B : ' + super.whoAmI();
        }
    }
    
*app/subdir/C.js*
    
    import Class from 'B'; // when not starting with './' or '../', the path will be 
                           // resolved relative to app diretory, so this is the same 
                           // as writing `import '../B'`
    
    var b = new Class();
    console.log(b.whoAmI()); //$> B : A
    
#### JSX classes

*app/Template.jsx*

    <div>
        <button if={this.state.showBtn} onClick={this.onBtnClick}>click me</button>
    </div>
    
*app/Control.js*

    import './Template';
    
    class Control extends Template {
        componentWillMount() {
            this.setState({showBtn:true});
        }
        onBtnClick() {
            alert('Button clicked!');
            this.setState({showBtn:false});
        }
    }
    
*app/Body.jsx*

    import 'Control'; // You may import in a jsx file just as how you would do in a js file
    
    <div>
        <Control/>
    </div>
    
*app/Main.js*

    import 'UIComponent';  // this is a builtin class, representing React component class 
                           // along with some extra features
    import 'Body';
    
    class Main extends UIComponent { // a example of how to define a React class 
                                     // directly in js code
        render() {
            return <Body/>;
        }
    }
    
    ReactDOM.render(<Main/>, document.body);
    
A jsx file generates a module exporting a React class rendering the contents of of the jsx file.

#### Stylus integration

*app/Style.styl*

    @import 'nib'; // nib is available to import
    
    color: #00F
    .message
        background: #F00
        
*app/Body.jsx*
    
    import 'Style';
    
    <div className={Style}>
        <div className="message">
            Hello World
        </div>
    </div>
    
Stylus files will construct a module which can be imported and used as a class name. 
Stylus style sheets will never be applied globally, it will only affect elements with corresponding
class name.

#### XMLHttpRequest

    // normal use of XMLHttpRequest, works for IE too
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://example.com', true);
    xhr.onreadystatechange = function() {if (xhr.readyState == 4) {...}};
    xhr.send();
    
    // convient AJAX methods, just as it is like when calling $.get or $.post
    XMLHttpRequest.get('http://example.com/api', function(result) {
        ...
    }, 'JSON');
    XMLHttpRequest.post('http://example.com/api', {param:value}, function(result) {
        ...
    }, 'JSON');
    XMLHttpRequest.jsonp('http://example.com/api?callback=?', function(result) {
        ...
    });
    
#### EventEmitter

    import 'EventEmitter';
    
    class Obj extends EventEmitter {
        set(val) {
            this.val;
            this.emit('updated');
        }
    }
    
    var obj = new Obj();
    obj.on('updated', function() {
        alert(obj.val);
    })
    obj.set('Hello!');
    
This is a show case of how EventEmitter can be used, visit the 
[EventEmitter](https://github.com/Olical/EventEmitter) project for further information.

Other than the normal use of EventEmitter, there's also an convient use with UIComponent.

    import 'UIComponent';
    import 'EventEmitter';
    
    class Widget extends UIComponent {
        componentWillMount() {
            this.follow(this.props.message, 'updated');
        }
        render() {
            return <div>{this.props.message.val}</div>;
        }
    }
    
    class Message extends EventEmitter {
        constructor() {
            super();
            this.val = '';
        }
        set(val) {
            this.val = val;
            this.emit('updated');
        }
    }
    
    var msg = new Message();
    ReactDOM.render(<Widget message={msg}/>, document.body);
    
    var counter = 0;
    setInterval(() => {
        msg.set(counter + 's elapsed');
        counter++;
    }, 1000);

Calling `this.follow(emitter, eventName='update')` in a UIComponent will make the 
component rerender when a sepcified event is emitted from emitter. The event listener
will be automatically unregistered when the component is unmounted.

Beware that `UIComponent.follow` may only be called in `UIComponent.componentWillMount`, 
and that's also where you should set initial component state.

A follow method is also defined in the `EventEmitter` it self to allow an emitter
to automatically emit an event when another emitter emits a corresponding event.
`EventEmitter.follow(anotherEmiter, eventName='update')[.as(emitEventName)]`
    
#### lodash, jQuery, and more

    import $ from 'jQuery';
    import _ from 'lodash';
    import _ from 'underscore';
    import 'chart';
    import Promise from 'bluebird';
    
You'll be able to use these popular libraries in your project just by a line of import.
Which and how libraries are loaded depends on configuration. Other external libraries can 
made available be by editing the library section of the configuration file.
    
#### A fully working example: Grocery list

Code along with compiled result are located in the example directory of the repo.

Caveat
------

 - Do not name variable or object member starting with `$$$AWF$$$`, which is used by the 
   AWF framework.
 - Do not define function or variable named `require`, it will break the import feature.
 - Do not put anything yourself in the `_build` directory if you don't want to mess up
   the auto-build.
 - Module names do not include anything after `.`, `app/Mod.A.js` should be imported as `Mod`.
   So `app/Mod.A.js` will conflict with `app/Mod.B.jsx`, and will cause an link error.
 - External libraries and built-in modules takes precedence when importing, so naming a local
   module as `UIComponent` will make the module unaccessible (A warning will be generated).
 - Circular import is not allowed. A link error will occur if done so.
 - When using stylus, the image and other urls should be relative to the source file.
 - Although the generated artifacts are compact, they are not minimized. You may save some 
   extra KB by using uglify.
 - ***This framework is still under development, don't use it for anything serious yet***
