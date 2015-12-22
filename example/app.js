(function() {
"use strict";function BEGIN(){function a(){var c=d.shift();return c?void $$$AWF$$$.loadScript(window.DEBUG?c.debug||c.url:c.url,a,c.id):b()}function b(){if("object"==typeof React&&"undefined"!=typeof React.createElement){var a=React.createElement;React.createElement=function(){var b=arguments[1];if(b&&"object"==typeof b){if("undefined"!=typeof b["if"]){var c=b["if"];if("function"==typeof c&&(c=c()),!c)return null}b.className&&Array.isArray(b.className)&&(b.className=b.className.join(" "))}return a.apply(React,arguments)}}setTimeout(function(){for(var a=$$$AWF$$$.queue,b=0;b<a.length;b++){var c=a[b];c.body.call(c,c,c.exports,$$$AWF$$$.require,$$$AWF$$$.XMLHttpRequest,$$$AWF$$$.loadScript)}$$$AWF$$$.queue=null},2)}var c=document.location;c.hash&&c.hash.match(/^\#?DEBUG$/)&&(window.DEBUG=!0),document.head||(document.head=document.getElementsByTagName("head")[0]),document.body||(document.body=document.getElementsByTagName("body")[0]);var d=$$$AWF$$$.extern;a()}var $$$AWF$$$="object"==typeof exports?exports:{};if($$$AWF$$$.mod={},$$$AWF$$$.queue=[],$$$AWF$$$.extern=[],$$$AWF$$$.define=function(a,b){var c={};c.body=b,c.name=a,c.exports={},$$$AWF$$$.queue.push(c),$$$AWF$$$.mod[a]=c},$$$AWF$$$.require=function(a){var b=$$$AWF$$$.mod[a]||{};return b.exports?(b.imported||"function"!=typeof b.exports.__beforeFirstImport||b.exports.__beforeFirstImport(),b.imported=!0,b.exports):{}},$$$AWF$$$.common={},$$$AWF$$$.common._temporalAssertDefined=function(a,b,c){if(a===c)throw new ReferenceError(b+" is not defined - temporal dead zone");return!0},$$$AWF$$$.common._inherits=function(a,b){if("function"!=typeof b&&null!==b)throw new TypeError("Super expression must either be null or a function, not "+typeof b);if($$$AWF$$$.legacyBrowser){var c=b.prototype;if(a.prototype={},c)for(var d in c)a.prototype[d]=c[d];a.prototype.$$$AWF$$$superClass=b}else a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}}),b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)},$$$AWF$$$.common._instanceof=function(a,b){if($$$AWF$$$.legacyBrowser){for(;a;){if(a==b||a instanceof b)return!0;a=a.$$$AWF$$$superClass}return!1}return null!=b&&b[Symbol.hasInstance]?b[Symbol.hasInstance](a):a instanceof b},$$$AWF$$$.common._classCallCheck=function(a,b){if(!($$$AWF$$$.legacyBrowser||a instanceof b))throw new TypeError("Cannot call a class as a function");a.$$$AWF$$$ClassType||(a.$$$AWF$$$ClassType=b)},$$$AWF$$$.common._interopRequireDefault=function(a){return a&&a.__esModule?a:{"default":a}},$$$AWF$$$.common._possibleConstructorReturn=function(a,b){if(!a)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!b||"object"!=typeof b&&"function"!=typeof b?a:b},$$$AWF$$$.common._newArrowCheck=function(a,b){if(a!==b)throw new TypeError("Cannot instantiate an arrow function")},$$$AWF$$$.common._boundProp=function(a,b){return"function"==typeof b?b.bind(a):b},"undefined"!=typeof document&&"undefined"!=typeof window){if($$$AWF$$$.legacyBrowser=!!function(){if("undefined"==typeof navigator)return!1;if(/MSIE (\d+\.\d+);/.test(navigator.userAgent)){var a=new Number(RegExp.$1);return 8>=a}return!1}(),"undefined"==typeof console){var dummy=function(){};window.console={assert:dummy,clear:dummy,count:dummy,debug:dummy,dir:dummy,dirxml:dummy,error:dummy,group:dummy,groupCollapsed:dummy,groupEnd:dummy,info:dummy,log:dummy,profile:dummy,profileEnd:dummy,table:dummy,time:dummy,timeEnd:dummy,timeStamp:dummy,trace:dummy,warn:dummy}}if($$$AWF$$$.legacyBrowser){var extern=$$$AWF$$$.extern;extern.push({url:"https://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.4.1/es5-shim.min.js"}),extern.push({url:"https://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.4.1/es5-sham.min.js"}),extern.push({url:"https://cdnjs.cloudflare.com/ajax/libs/json3/3.3.2/json3.min.js"})}!function(a){function b(){d||(d=!0,setTimeout(a,1))}function c(){if(!d){try{document.documentElement.doScroll("left")}catch(a){return void setTimeout(c,1)}b()}}var d=!1;return"complete"==document.readyState?b():void(document.addEventListener?(document.addEventListener("DOMContentLoaded",function(){b()},!1),window.addEventListener("load",b,!1)):document.attachEvent&&(document.attachEvent("onreadystatechange",function(){("complete"==document.readyState||"loaded"==document.readyState)&&b()}),window.attachEvent("onload",b),document.documentElement.doScroll&&!window.frameElement&&c()))}(BEGIN),$$$AWF$$$.XMLHttpRequest=function(){function a(){if(f)return new XMLHttpRequest;for(var a=0;a<g.length;a++)try{return new ActiveXObject(g[a])}catch(b){}}function b(b){return function(c,d,e,f){return a.invoke(b,c,d,e,f)}}function c(a){var b=[];for(var c in a)b.push(encodeURIComponent(c)+"="+encodeURIComponent(a[c]));return b.join("&")}function d(a){var b=a.match(/^(?:(?:([a-z]+:)\/\/)([^\/]+))?([^\?]*)?(\?[^\#]*)?(\#.*)?$/i);if(!b[1])return i=i||d(document.location.href),d("/"==a.substr(0,1)?i.origin+a:i.origin+i.pathname.replace(/\/[^\/]*$/,"/")+a);var c={protocol:b[1],host:b[2],pathname:b[3],search:b[4]||"",hash:b[5]||""},e=c.host.split(":");return c.hostname=e[1],c.port=(e[2]||80)-0,c.origin=c.protocol+"//"+c.host,c}function e(a,b){var c={},d=a.replace(/^\?/,"");if(d){d=d.split("&");for(var e=0;e<d.length;e++){var f=d[e].split("=").map(decodeURIComponent);c[f[0]]=f[1]}}if(b&&"object"==typeof b)for(var g in b)c[g]=b[g];return c}var f="undefined"!=typeof XMLHttpRequest,g=["Msxml2.XMLHTTP","Msxml3.XMLHTTP","Microsoft.XMLHTTP"];a.invoke=function(b,f,g,h,i){b=b.toUpperCase(),"function"==typeof g&&(i=h,h=g,g=""),i&&(i=i.toLowerCase()),i&&"text"!=i||(i="html");var j=new a,k=null,l=d(f);if("object"==typeof g)"GET"==b?(f=l.origin+l.pathname,g=c(e(l.search,g)),g&&(f+="?"+g),g=""):g.__json?(delete g.__json,g=JSON.stringify(g),k="application/json"):(g=c(g),k="application/x-www-form-urlencoded");else{if(g)throw new Error("Expecting send data to be a valid object");g="",f=l.origin+l.pathname+l.search}return j.open(b,f,!0),k&&j.setRequestHeader("Content-type",k),j.onreadystatechange=function(){if(4==j.readyState&&"function"==typeof h){var a=j.responseText,b=j.status;if("json"==i)if(a)try{a=JSON.parse(a)}catch(c){a=null,console.warn(c.stack||c)}else a=null;h(a,b)}},j.send(g),j},a.get=b("get"),a.post=b("post"),a.put=b("put"),a["delete"]=b("delete");var h=0;a.jsonp=function(a,b,f){"function"==typeof b&&(f=b,b={});var g=d(a);b=e(g.search,b);var i="$$$AWF$$$jsonP"+(new Date).getTime()+"_"+ ++h;for(var j in b)"?"==b[j]&&(b[j]=i);b=c(b),b&&(b="?"+b),a=g.origin+g.pathname+b,window[i]=f,$$$AWF$$$.loadScript(a,function(a,b){delete window[i],b.uncache()})};var i;return a}(),$$$AWF$$$.loadScript=function(){function a(a,c,d){function e(){function b(){if(!e){e=!0;for(var a=d?window[d]:null,b=0;b<f.cb.length;b++)f.cb[b](a,f);f.arg=a,f.cb=null}}var c=document.createElement("script");f.ele=c,c.type="text/javascript",c.onload=b,c.onreadystatechange=function(){("loaded"==c.readyState||"complete"==c.readyState)&&setTimeout(b,5)};var e=!1;c.src=a,document.head.appendChild(c)}if(d&&window[d])return c();var f=b[a];f||(f=b[a]={cb:[],ele:null,uncache:function(){delete b[a],this.ele.parentNode&&this.ele.parentNode.removeChild(this.ele)},arg:null},setTimeout(e,2)),"function"==typeof c&&(f.cb?f.cb.push(c):c(f.arg,f))}var b=window.$$$AWF$$$loadingScript=window.$$$AWF$$$loadingScript||{};return a}()}
$$$AWF$$$.extern.push({id:"EventEmitter",url:"https://cdnjs.cloudflare.com/ajax/libs/EventEmitter/4.3.0/EventEmitter.min.js"}),$$$AWF$$$.define("EventEmitter",function(a,b,c){a.exports=EventEmitter,EventEmitter.prototype.follow=function(a,b){function c(a){f=a}b=b||"update";var d=this.$$$AWF$$$Private$EventEmitter=this.$$$AWF$$$Private$EventEmitter||[],e=this,f=b,g=function(){var a=[f].concat(arguments);return e.emit.apply(e,a)};return d.push([a,b,g]),a.on(b,g),{as:c}},EventEmitter.prototype.unfollow=function(a,b){b=b||"update";var c=this.$$$AWF$$$Private$EventEmitter;if(c)for(var d=0;d<c.length;d++){var e=c[d];e[0]==a&&e[1]==b&&a.off(b,e[2])}}});
$$$AWF$$$.define("UIComponent",function(a,b,c){function d(){React.Component.call(this),this.state||(this.state={});var a=this.$$$AWF$$$Private$$$UIComponent={};a.follows=[],a.mounting=!1;var b=this.componentWillMount;"function"==typeof b&&(this.componentWillMount=function(){a.mounting=!0,b.apply(this,arguments),a.mounting=!1});var c=this.componentWillUnmount;"function"!=typeof c&&(c=!1),this.componentWillUnmount=function(){for(var b=0;b<a.follows.length;b++){var d=a.follows[b];"function"==typeof d.emitter.off&&d.emitter.off(d.evt,d.handler)}c&&c.apply(this,arguments)}}a.exports=d,$$$AWF$$$.common._inherits(d,React.Component),d.prototype.follow=function(a,b){if(!this.$$$AWF$$$Private$$$UIComponent.mounting)throw new Error("`follow ` may only be called in `componentWillMount` method");if(!a)throw new Error("Followed event emitter may not be empty");if(b=b||"update",a instanceof Array)for(var c=0;c<a.length;c++)this.follow(a[c],b);else if("function"==typeof a.on){var d=this,e=this.$$$AWF$$$Private$$$UIComponent,f={emitter:a,evt:b,handler:function(){d.forceUpdate()}};e.follows.push(f),a.on(b,f.handler),f.handler()}},d.prototype.bindState=function(a){var b=this;return function(c){var d={};d[a]=c.target.value,b.setState(d)}},d.render=function(){return ReactDOM.render.apply(ReactDOM,arguments)}});
$$$AWF$$$.extern.push({"id":"React","url":"https://cdnjs.cloudflare.com/ajax/libs/react/0.14.3/react.min.js","debug":"https://cdnjs.cloudflare.com/ajax/libs/react/0.14.3/react.js"});$$$AWF$$$.define("React", function(module) {module.exports=window.React;});
$$$AWF$$$.extern.push({"id":"ReactDOM","url":"https://cdnjs.cloudflare.com/ajax/libs/react/0.14.3/react-dom.min.js","debug":"https://cdnjs.cloudflare.com/ajax/libs/react/0.14.3/react-dom.js"});$$$AWF$$$.define("ReactDOM", function(module) {module.exports=window.ReactDOM;});
$$$AWF$$$.define("GroceryList/ListItem/Model", function(module, exports, require, XMLHttpRequest, loadScript) {
'use strict';var _interopRequireDefault=$$$AWF$$$.common._interopRequireDefault;var _classCallCheck=$$$AWF$$$.common._classCallCheck;var _possibleConstructorReturn=$$$AWF$$$.common._possibleConstructorReturn;var _inherits=$$$AWF$$$.common._inherits;var _EventEmitter2=require('EventEmitter');var _EventEmitter3=_interopRequireDefault(_EventEmitter2);var counter=0;var Model=(function(_EventEmitter){_inherits(Model,_EventEmitter);function Model(parent,text){var crossed=arguments.length <= 2 || arguments[2] === undefined?false:arguments[2];_classCallCheck(this,Model);var _this=_possibleConstructorReturn(this,_EventEmitter.call(this));_this.id = counter++;_this.parent = parent;_this.text = text;_this.crossed = crossed;return _this;}Model.prototype.cross = (function(){function cross(){this.crossed = true;this.emit('update');}return cross;})();Model.prototype.remove = (function(){function remove(){this.parent.removeItem(this);}return remove;})();Model.prototype.toJSON = (function(){function toJSON(){return {text:this.text,crossed:this.crossed};}return toJSON;})();return Model;})(_EventEmitter3['default']);exports['default'] = Model;module.exports = Model;
});
$$$AWF$$$.define("GroceryList/ListItem/View", function(module, exports, require, XMLHttpRequest, loadScript) {
'use strict';var _interopRequireDefault=$$$AWF$$$.common._interopRequireDefault;var _classCallCheck=$$$AWF$$$.common._classCallCheck;var _possibleConstructorReturn=$$$AWF$$$.common._possibleConstructorReturn;var _inherits=$$$AWF$$$.common._inherits;exports.__esModule = true;var _UIComponent2=require('UIComponent');var _UIComponent3=_interopRequireDefault(_UIComponent2);var ViewJSX=(function(_UIComponent){_inherits(ViewJSX,_UIComponent);function ViewJSX(){_classCallCheck(this,ViewJSX);return _possibleConstructorReturn(this,_UIComponent.apply(this,arguments));}ViewJSX.prototype.render = (function(){function render(){return React.createElement('div',{className:["item",this.model.crossed?'crossed':'']},this.model.text,React.createElement('div',{className:'cross','if':!this.model.crossed,onClick:$$$AWF$$$.common._boundProp(this.model,this.model.cross)}),React.createElement('div',{className:'remove','if':$$$AWF$$$.common._boundProp(this.model,this.model.crossed),onClick:$$$AWF$$$.common._boundProp(this.model,this.model.remove)}));}return render;})();return ViewJSX;})(_UIComponent3['default']);exports['default'] = ViewJSX;
});
$$$AWF$$$.define("GroceryList/ListItem/Component", function(module, exports, require, XMLHttpRequest, loadScript) {
'use strict';var _interopRequireDefault=$$$AWF$$$.common._interopRequireDefault;var _classCallCheck=$$$AWF$$$.common._classCallCheck;var _possibleConstructorReturn=$$$AWF$$$.common._possibleConstructorReturn;var _inherits=$$$AWF$$$.common._inherits;var _View2=require('GroceryList/ListItem/View');var _View3=_interopRequireDefault(_View2);var Component=(function(_View){_inherits(Component,_View);function Component(){_classCallCheck(this,Component);return _possibleConstructorReturn(this,_View.apply(this,arguments));}Component.prototype.componentWillMount = (function(){function componentWillMount(){this.model = this.props.model;this.follow(this.model);}return componentWillMount;})();return Component;})(_View3['default']);exports['default'] = Component;module.exports = Component;
});
$$$AWF$$$.define("GroceryList/ListItem", function(module, exports, require, XMLHttpRequest, loadScript) {
'use strict';var _interopRequireDefault=$$$AWF$$$.common._interopRequireDefault;exports.__esModule = true;var _Component=require('GroceryList/ListItem/Component');var _Component2=_interopRequireDefault(_Component);exports['default'] = _Component2['default'];
});
$$$AWF$$$.define("GroceryList/Model", function(module, exports, require, XMLHttpRequest, loadScript) {
'use strict';var _interopRequireDefault=$$$AWF$$$.common._interopRequireDefault;var _classCallCheck=$$$AWF$$$.common._classCallCheck;var _possibleConstructorReturn=$$$AWF$$$.common._possibleConstructorReturn;var _inherits=$$$AWF$$$.common._inherits;var _Model=require('GroceryList/ListItem/Model');var _Model2=_interopRequireDefault(_Model);var _EventEmitter2=require('EventEmitter');var _EventEmitter3=_interopRequireDefault(_EventEmitter2);function _typeof(obj){return obj && typeof Symbol !== "undefined" && obj['constructor'] === Symbol?"symbol":typeof obj;}var Model=(function(_EventEmitter){_inherits(Model,_EventEmitter);function Model(){_classCallCheck(this,Model);var _this=_possibleConstructorReturn(this,_EventEmitter.call(this));_this.list = [];if(localStorage.GroceryList){var list=JSON.parse(localStorage.GroceryList);var _iter2=list;if(_iter2 && 'object' === (typeof _iter2 === 'undefined'?'undefined':_typeof(_iter2))){var _iter3=Array.isArray(_iter2)?0:Object.keys(_iter2),_iter=0,_iter4=_iter3?_iter3.length:_iter2.length;for(;_iter < _iter4;++_iter) {var item=_iter3?_iter2[_iter3[_iter]]:_iter2[_iter];item = new _Model2['default'](_this,item.text,item.crossed);_this.follow(item);_this.list.push(item);}}}_this.on('update',_this.saveOnUpdate);return _this;}Model.prototype.addItem = (function(){function addItem(text){if(!text)return;var item=new _Model2['default'](this,text);this.follow(item);this.list.push(item);this.emit('update');return item;}return addItem;})();Model.prototype.removeItem = (function(){function removeItem(item){for(var i=0;i < this.list.length;i++) {if(this.list[i] == item){this.list.splice(i,1);this.unfollow(item);this.emit('update');break;}}}return removeItem;})();Model.prototype.saveOnUpdate = (function(){function saveOnUpdate(){localStorage.setItem("GroceryList",JSON.stringify(this.list));}return saveOnUpdate;})();return Model;})(_EventEmitter3['default']);exports['default'] = Model;module.exports = Model;
});
$$$AWF$$$.define("GroceryList/Style", function(module, exports, require, XMLHttpRequest, loadScript) {
module.exports="AQW-kVZyZQ-Style";
});
$$$AWF$$$.define("GroceryList/View", function(module, exports, require, XMLHttpRequest, loadScript) {
'use strict';var _interopRequireDefault=$$$AWF$$$.common._interopRequireDefault;var _newArrowCheck=$$$AWF$$$.common._newArrowCheck;var _classCallCheck=$$$AWF$$$.common._classCallCheck;var _possibleConstructorReturn=$$$AWF$$$.common._possibleConstructorReturn;var _inherits=$$$AWF$$$.common._inherits;exports.__esModule = true;var _UIComponent2=require('UIComponent');var _UIComponent3=_interopRequireDefault(_UIComponent2);var _Style=require('GroceryList/Style');var _Style2=_interopRequireDefault(_Style);var _ListItem=require('GroceryList/ListItem');var _ListItem2=_interopRequireDefault(_ListItem);var ViewJSX=(function(_UIComponent){_inherits(ViewJSX,_UIComponent);function ViewJSX(){_classCallCheck(this,ViewJSX);return _possibleConstructorReturn(this,_UIComponent.apply(this,arguments));}ViewJSX.prototype.render = (function(){function render(){var _this2=this;return React.createElement('div',{className:_Style2['default']},React.createElement('div',{className:'title'},'Grocery List'),React.createElement('div',{className:'list'},this.model.list.map((function(item){_newArrowCheck(this,_this2);return React.createElement(_ListItem2['default'],{key:$$$AWF$$$.common._boundProp(item,item.id),model:item});}).bind(this))),React.createElement('div',{className:'control'},React.createElement('input',{type:'text',onChange:this.bindState('input'),value:$$$AWF$$$.common._boundProp(this.state,this.state.input)}),React.createElement('button',{onClick:$$$AWF$$$.common._boundProp(this,this.addItem)},'Add')));}return render;})();return ViewJSX;})(_UIComponent3['default']);exports['default'] = ViewJSX;
});
$$$AWF$$$.define("GroceryList/Component", function(module, exports, require, XMLHttpRequest, loadScript) {
'use strict';var _interopRequireDefault=$$$AWF$$$.common._interopRequireDefault;var _classCallCheck=$$$AWF$$$.common._classCallCheck;var _possibleConstructorReturn=$$$AWF$$$.common._possibleConstructorReturn;var _inherits=$$$AWF$$$.common._inherits;var _View2=require('GroceryList/View');var _View3=_interopRequireDefault(_View2);var _Model=require('GroceryList/Model');var _Model2=_interopRequireDefault(_Model);var Component=(function(_View){_inherits(Component,_View);function Component(){_classCallCheck(this,Component);return _possibleConstructorReturn(this,_View.apply(this,arguments));}Component.prototype.componentWillMount = (function(){function componentWillMount(){this.model = new _Model2['default']();this.follow(this.model);}return componentWillMount;})();Component.prototype.addItem = (function(){function addItem(){this.model.addItem(this.state.input);this.setState({input:''});}return addItem;})();return Component;})(_View3['default']);exports['default'] = Component;module.exports = Component;
});
$$$AWF$$$.define("GroceryList", function(module, exports, require, XMLHttpRequest, loadScript) {
'use strict';var _interopRequireDefault=$$$AWF$$$.common._interopRequireDefault;exports.__esModule = true;var _Component=require('GroceryList/Component');var _Component2=_interopRequireDefault(_Component);exports['default'] = _Component2['default'];
});
$$$AWF$$$.define("main", function(module, exports, require, XMLHttpRequest, loadScript) {
'use strict';var _interopRequireDefault=$$$AWF$$$.common._interopRequireDefault;var _GroceryList=require('GroceryList');var _GroceryList2=_interopRequireDefault(_GroceryList);var _UIComponent=require('UIComponent');var _UIComponent2=_interopRequireDefault(_UIComponent);_UIComponent2['default'].render(React.createElement(_GroceryList2['default'],null),document.body);
});
})();
//# sourceMappingURL=app/_build/js.map