AQ Web Front
============

AWF is a compilation framework to allow coding web frontends in a modern style.

Integration of some of the currently best frontend frameworks: Babel, React and Stylus.

 - [Installation](#installation)
 - [Usage](#usage)
 - [Features](#features)
 - [Directory Structure](#directory-structure)
 - [Examples](#examples)

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

    Project Root/ --+-- app/ -----------+-- ClassA.js
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

 - Items marked `@` are generated by this framework
 - As described in the usage description, 
   the names of app.* or app.*.map files will follow the name of app directory
 - _build directory is used for caching, deleting will cause a full recompile.
   ***Please Leave This Directory Alone***, do not put anything useful in here.

Examples
--------

 - [Basic Usage](#basic-usage)
 - [ES2015](#es2015)
 - [Module import and export](#module-import-and-export)
 - [JSX classes](#jsx-classes)
 - [Stylus integration](#stylus-integration)
 - [XMLHttpRequest](#xmlhttprequest)
 - [EventEmitter](#eventemitter)
 - [lodash and jQuery](#lodash-and-jquery)
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
 - React deprecates rendering to document.body, but you won't see the warning message.
   This is because normally the minified version of react is loaded.
   You will be able to see warning messages and detailed React error messages in debug mode.
   Adding `<script type="text/javascript">DEBUG=true</script>` before loading app.js,
   or apending '#DEBUG' to the url when navigating (may need to refresh) to activate debug mode.
 - With the help of source map, you'll be able to trace where the console output is written in
   the source files. Some browsers (such as safari) will cache source map files, may need to
   clean caching manually.

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
    
    import '../A'; // will be parsed as `import * as A from '../A';`
    
    export default ClassB extends A {
        whoAmI() {
            return 'B : ' + super.whoAmI();
        }
    }
    
*app/subdir/C.js*
    
    import * as Class from 'B'; // when not starting with './' or '../', the path will be resolved
                                // relative to app diretory, so this is the same as import '../B'
    
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

Calling `this.follow(emitter, eventName)` in a UIComponent will make the component
rerender when a sepcified event is emitted from emitter. The event listener will 
be automatically unregistered when the component is unmounted, no need to hassle 
calling `off` and keeping handler functions.

Note `this.follow` may only be called in `componentWillMount`, and that's also where
you should set initial component state.
    
#### lodash and jQuery

    import * as _ from 'lodash'; // underscore may also be used if prefered
    import * as $ from 'jQuery';
    
#### A fully working example: Grocery list

Document needs further completion.

Caveat
------

 - Please do not define a module named `UIComponent`, it will mess up React Support.
 - Do not name variable as `$$$AWF$$$`, which is used by the AWF framework.
 - Module names do not include anything after `.`, `app/Mod.A.js` should be imported as `Mod`.
   So `app/Mod.A.js` will conflict with `app/Mod.B.jsx`, and will cause an link error.
 - Circular import is not allowed. A link error will occur if done so.
