(function() {
"use strict";var $$$AWF$$$=typeof exports=="object"?exports:{};$$$AWF$$$.mod={};$$$AWF$$$.queue=[];$$$AWF$$$.extern=[];$$$AWF$$$.define=function(modName,modFunc){var mod={};mod.body=modFunc;mod.name=modName;mod.exports={};$$$AWF$$$.queue.push(mod);$$$AWF$$$.mod[modName]=mod};$$$AWF$$$.require=function(modName){var mod=$$$AWF$$$.mod[modName]||{};if(mod.exports){if(!mod.imported&&typeof mod.exports.__beforeFirstImport=="function"){mod.exports.__beforeFirstImport()}mod.imported=true;return mod.exports}return{}};function BEGIN(){var loc=document.location;if(loc.hash&&loc.hash.match(/^\#?DEBUG$/))window.DEBUG=true;if(!document.head){document.head=document.getElementsByTagName("head")[0]}if(!document.body){document.body=document.getElementsByTagName("body")[0]}var extern=$$$AWF$$$.extern;next();function next(){var item=extern.shift();if(!item)return ready();$$$AWF$$$.loadScript(window.DEBUG?item.debug||item.url:item.url,next,item.id)}function ready(){if(typeof React=="object"&&typeof React.createElement!="undefined"){var createElement=React.createElement;React.createElement=function(){var options=arguments[1];if(options&&typeof options=="object"){if(typeof options["if"]!="undefined"){var condition=options["if"];if(typeof condition=="function"){condition=condition()}if(!condition){return null}}if(options.className&&Array.isArray(options.className)){options.className=options.className.join(" ")}}return createElement.apply(React,arguments)}}setTimeout(function(){var queue=$$$AWF$$$.queue;for(var i=0;i<queue.length;i++){var mod=queue[i];mod.body.call(mod,mod,mod.exports,$$$AWF$$$.require,$$$AWF$$$.XMLHttpRequest,$$$AWF$$$.loadScript)}$$$AWF$$$.queue=null},2)}}$$$AWF$$$.common={};$$$AWF$$$.common._temporalAssertDefined=function(val,name,undef){if(val===undef){throw new ReferenceError(name+" is not defined - temporal dead zone")}return true};$$$AWF$$$.common._inherits=function(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass)}if($$$AWF$$$.legacyBrowser){var proto=superClass.prototype;subClass.prototype={};if(proto){for(var k in proto){subClass.prototype[k]=proto[k]}}subClass.prototype.$$$AWF$$$superClass=superClass}else{subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass){Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass}}};$$$AWF$$$.common._instanceof=function(left,right){if($$$AWF$$$.legacyBrowser){while(left){if(left==right||left instanceof right){return true}left=left.$$$AWF$$$superClass}return false}else{if(right!=null&&right[Symbol.hasInstance]){return right[Symbol.hasInstance](left)}else{return left instanceof right}}};$$$AWF$$$.common._classCallCheck=function(instance,Constructor){if(!$$$AWF$$$.legacyBrowser&&!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function")}if(!instance.$$$AWF$$$ClassType){instance.$$$AWF$$$ClassType=Constructor}};$$$AWF$$$.common._interopRequireDefault=function(obj){return obj&&obj.__esModule?obj:{"default":obj}};$$$AWF$$$.common._possibleConstructorReturn=function(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return call&&(typeof call==="object"||typeof call==="function")?call:self};$$$AWF$$$.common._newArrowCheck=function(innerThis,boundThis){if(innerThis!==boundThis){throw new TypeError("Cannot instantiate an arrow function")}};$$$AWF$$$.common._boundProp=function(context,item){if(typeof item=="function"){return item.bind(context)}return item};if(typeof document!="undefined"&&typeof window!="undefined"){$$$AWF$$$.legacyBrowser=!!function(){if(typeof navigator=="undefined")return false;if(/MSIE (\d+\.\d+);/.test(navigator.userAgent)){var ieversion=new Number(RegExp.$1);return ieversion<=8}return false}();if(typeof console=="undefined"){var dummy=function(){};window.console={assert:dummy,clear:dummy,count:dummy,debug:dummy,dir:dummy,dirxml:dummy,error:dummy,group:dummy,groupCollapsed:dummy,groupEnd:dummy,info:dummy,log:dummy,profile:dummy,profileEnd:dummy,table:dummy,time:dummy,timeEnd:dummy,timeStamp:dummy,trace:dummy,warn:dummy}}if($$$AWF$$$.legacyBrowser){var extern=$$$AWF$$$.extern;extern.push({url:"//cdn.bootcss.com/es5-shim/4.4.0/es5-shim.min.js"});extern.push({url:"//cdn.bootcss.com/es5-shim/4.4.0/es5-sham.min.js"});extern.push({url:"//cdn.bootcss.com/json3/3.3.2/json3.min.js"})}(function(readyFunc){var readyCalled=false;function ready(){if(readyCalled)return;readyCalled=true;setTimeout(readyFunc,1)}if(document.readyState=="complete")return ready();if(document.addEventListener){document.addEventListener("DOMContentLoaded",function(){ready()},false);window.addEventListener("load",ready,false)}else if(document.attachEvent){document.attachEvent("onreadystatechange",function(){if(document.readyState=="complete"||document.readyState=="loaded"){ready()}});window.attachEvent("onload",ready);if(document.documentElement.doScroll&&!window.frameElement)doScrollCheck()}function doScrollCheck(){if(readyCalled)return;try{document.documentElement.doScroll("left")}catch(e){setTimeout(doScrollCheck,1);return}ready()}})(BEGIN);$$$AWF$$$.XMLHttpRequest=function(){var isNative=typeof XMLHttpRequest!=="undefined";var activeX=["Msxml2.XMLHTTP","Msxml3.XMLHTTP","Microsoft.XMLHTTP"];function Request(){if(isNative){return new XMLHttpRequest}else{for(var i=0;i<activeX.length;i++){try{return new ActiveXObject(activeX[i])}catch(e){}}}}Request.invoke=function(method,url,send,callback,resultType){method=method.toUpperCase();if(typeof send=="function"){resultType=callback;callback=send;send=""}if(resultType)resultType=resultType.toLowerCase();if(!resultType||resultType=="text"){resultType="html"}var xhr=new Request;var sendType=null;var parsedUrl=parseUrl(url);if(typeof send=="object"){if(method=="GET"){url=parsedUrl.origin+parsedUrl.pathname;send=urlencode(parseQuery(parsedUrl.search,send));if(send){url+="?"+send}send=""}else if(send.__json){delete send.__json;send=JSON.stringify(send);sendType="application/json"}else{send=urlencode(send);sendType="application/x-www-form-urlencoded"}}else if(send){throw new Error("Expecting send data to be a valid object")}else{send="";url=parsedUrl.origin+parsedUrl.pathname+parsedUrl.search}xhr.open(method,url,true);if(sendType)xhr.setRequestHeader("Content-type",sendType);xhr.onreadystatechange=function(){if(xhr.readyState!=4||typeof callback!="function")return;var response=xhr.responseText;var status=xhr.status;if(resultType=="json"){if(!response)response=null;else{try{response=JSON.parse(response)}catch(e){response=null;console.warn(e.stack||e)}}}callback(response,status)};xhr.send(send);return xhr};Request.get=invoker("get");Request.post=invoker("post");Request.put=invoker("put");Request["delete"]=invoker("delete");var jsonpCounter=0;Request.jsonp=function(url,send,callback){if(typeof send=="function"){callback=send;send={}}var parsed=parseUrl(url);send=parseQuery(parsed.search,send);var cbname="$$$AWF$$$jsonP"+(new Date).getTime()+"_"+ ++jsonpCounter;for(var k in send){if(send[k]=="?"){send[k]=cbname}}send=urlencode(send);if(send)send="?"+send;url=parsed.origin+parsed.pathname+send;window[cbname]=callback;$$$AWF$$$.loadScript(url,function(arg,loader){delete window[cbname];loader.uncache()})};function invoker(type){return function(url,send,callback,resultType){return Request.invoke(type,url,send,callback,resultType)}}function urlencode(obj){var ret=[];for(var k in obj){ret.push(encodeURIComponent(k)+"="+encodeURIComponent(obj[k]))}return ret.join("&")}var localUrl;function parseUrl(url){var m=url.match(/^(?:(?:([a-z]+:)\/\/)([^\/]+))?([^\?]*)?(\?[^\#]*)?(\#.*)?$/i);if(!m[1]){localUrl=localUrl||parseUrl(document.location.href);if(url.substr(0,1)=="/"){return parseUrl(localUrl.origin+url)}else{return parseUrl(localUrl.origin+localUrl.pathname.replace(/\/[^\/]*$/,"/")+url)}}var ret={protocol:m[1],host:m[2],pathname:m[3],search:m[4]||"",hash:m[5]||""};var host=ret.host.split(":");ret.hostname=host[1];ret.port=(host[2]||80)-0;ret.origin=ret.protocol+"//"+ret.host;return ret}function parseQuery(search,obj){var parsed={};var query=search.replace(/^\?/,"");if(query){query=query.split("&");for(var i=0;i<query.length;i++){var item=query[i].split("=").map(decodeURIComponent);parsed[item[0]]=item[1]}}if(obj&&typeof obj=="object"){for(var k in obj){parsed[k]=obj[k]}}return parsed}return Request}();$$$AWF$$$.loadScript=function(){var loading=window.$$$AWF$$$loadingScript=window.$$$AWF$$$loadingScript||{};function loadScript(url,callback,checkVar){if(checkVar&&window[checkVar])return callback();var queue=loading[url];if(!queue){queue=loading[url]={cb:[],ele:null,uncache:function(){delete loading[url];if(this.ele.parentNode)this.ele.parentNode.removeChild(this.ele)},arg:null};setTimeout(load,2)}if(typeof callback=="function"){if(queue.cb){queue.cb.push(callback)}else{callback(queue.arg,queue)}}function load(){var loader=document.createElement("script");queue.ele=loader;loader.type="text/javascript";loader.onload=end;loader.onreadystatechange=function(){if(loader.readyState=="loaded"||loader.readyState=="complete"){setTimeout(end,5)}};var ended=false;function end(){if(ended)return;ended=true;var arg=checkVar?window[checkVar]:null;for(var i=0;i<queue.cb.length;i++){queue.cb[i](arg,queue)}queue.arg=arg;queue.cb=null}loader.src=url;document.head.appendChild(loader)}}return loadScript}()}
$$$AWF$$$.extern.push({id:"EventEmitter",url:"http://cdn.bootcss.com/EventEmitter/4.3.0/EventEmitter.min.js"});$$$AWF$$$.define("EventEmitter",function(module,exports,require){module.exports=EventEmitter;EventEmitter.prototype.follow=function(emitter,evtName,changeName){var list=this.$$$AWF$$$Private$EventEmitter=this.$$$AWF$$$Private$EventEmitter||[];var self=this;var func=function(){var args=[changeName||evtName].concat(arguments);return self.emit.apply(self,args)};list.push([emitter,evtName,func]);emitter.on(evtName,func)};EventEmitter.prototype.unfollow=function(emitter,evtName){var list=this.$$$AWF$$$Private$EventEmitter;if(!list)return;for(var i=0;i<list.length;i++){var item=list[i];if(item[0]==emitter&&(!evtName||item[1]==evtName)){emitter.off(evtName,item[2])}}}});
$$$AWF$$$.define("UIComponent",function(module,exports,require){module.exports=UIComponent;$$$AWF$$$.common._inherits(UIComponent,React.Component);function UIComponent(){React.Component.call(this);if(!this.state)this.state={};var priv=this.$$$AWF$$$Private$$$UIComponent={};priv.follows=[];priv.mounting=false;var willMount=this.componentWillMount;if(typeof willMount=="function"){this.componentWillMount=function(){priv.mounting=true;willMount.apply(this,arguments);priv.mounting=false}}var willUnmount=this.componentWillUnmount;if(typeof willUnmount!="function"){willUnmount=false}this.componentWillUnmount=function(){for(var i=0;i<priv.follows.length;i++){var item=priv.follows[i];if(typeof item.emitter.off=="function"){item.emitter.off(item.evt,item.handler)}}if(willUnmount){willUnmount.apply(this,arguments)}}}UIComponent.prototype.follow=function(emitter,evt){if(!this.$$$AWF$$$Private$$$UIComponent.mounting){throw new Error("`follow ` may only be called in `componentWillMount` method")}if(!emitter){throw new Error("Followed event emitter may not be empty")}if(!evt){throw new Error("Followed event may not be empty")}if(emitter instanceof Array){for(var i=0;i<emitter.length;i++){this.follow(emitter[i],evt)}}else if(typeof emitter.on=="function"){var self=this;var priv=this.$$$AWF$$$Private$$$UIComponent;var item={emitter:emitter,evt:evt,handler:function(){self.forceUpdate()}};priv.follows.push(item);emitter.on(evt,item.handler);item.handler()}};UIComponent.prototype.bindState=function(name){var self=this;return function(e){var state={};state[name]=e.target.value;self.setState(state)}};UIComponent.render=function(){return ReactDOM.render.apply(ReactDOM,arguments)}});
$$$AWF$$$.extern.push({"id":"React","url":"http://cdn.bootcss.com/react/0.14.3/react.min.js","debug":"http://cdn.bootcss.com/react/0.14.3/react.js"});$$$AWF$$$.define("React", function(module) {module.exports=window.React;});
$$$AWF$$$.extern.push({"id":"ReactDOM","url":"http://cdn.bootcss.com/react/0.14.3/react-dom.js","debug":"http://cdn.bootcss.com/react/0.14.3/react-dom.min.js"});$$$AWF$$$.define("ReactDOM", function(module) {module.exports=window.ReactDOM;});
$$$AWF$$$.define("GroceryList/ListItem/Model", function(module, exports, require, XMLHttpRequest, loadScript) {
'use strict';var _interopRequireDefault=$$$AWF$$$.common._interopRequireDefault;var _classCallCheck=$$$AWF$$$.common._classCallCheck;var _possibleConstructorReturn=$$$AWF$$$.common._possibleConstructorReturn;var _inherits=$$$AWF$$$.common._inherits;var _EventEmitter2=require('EventEmitter');var _EventEmitter3=_interopRequireDefault(_EventEmitter2);var counter=0;var Model=(function(_EventEmitter){_inherits(Model,_EventEmitter);function Model(parent,text){var crossed=arguments.length <= 2 || arguments[2] === undefined?false:arguments[2];_classCallCheck(this,Model);var _this=_possibleConstructorReturn(this,_EventEmitter.call(this));_this.id = counter++;_this.parent = parent;_this.text = text;_this.crossed = crossed;return _this;}Model.prototype.cross = (function(){function cross(){this.crossed = true;this.emit('update');}return cross;})();Model.prototype.remove = (function(){function remove(){this.parent.removeItem(this);}return remove;})();Model.prototype.toJSON = (function(){function toJSON(){return {text:this.text,crossed:this.crossed};}return toJSON;})();return Model;})(_EventEmitter3['default']);exports['default'] = Model;module.exports = Model;
});
$$$AWF$$$.define("GroceryList/ListItem/View", function(module, exports, require, XMLHttpRequest, loadScript) {
'use strict';var _interopRequireDefault=$$$AWF$$$.common._interopRequireDefault;var _classCallCheck=$$$AWF$$$.common._classCallCheck;var _possibleConstructorReturn=$$$AWF$$$.common._possibleConstructorReturn;var _inherits=$$$AWF$$$.common._inherits;exports.__esModule = true;var _UIComponent2=require('UIComponent');var _UIComponent3=_interopRequireDefault(_UIComponent2);var ViewJSX=(function(_UIComponent){_inherits(ViewJSX,_UIComponent);function ViewJSX(){_classCallCheck(this,ViewJSX);return _possibleConstructorReturn(this,_UIComponent.apply(this,arguments));}ViewJSX.prototype.render = (function(){function render(){return React.createElement('div',{className:["item",this.model.crossed?'crossed':'']},this.model.text,React.createElement('div',{className:'cross','if':!this.model.crossed,onClick:$$$AWF$$$.common._boundProp(this.model,this.model.cross)}),React.createElement('div',{className:'remove','if':$$$AWF$$$.common._boundProp(this.model,this.model.crossed),onClick:$$$AWF$$$.common._boundProp(this.model,this.model.remove)}));}return render;})();return ViewJSX;})(_UIComponent3['default']);exports['default'] = ViewJSX;
});
$$$AWF$$$.define("GroceryList/ListItem/Component", function(module, exports, require, XMLHttpRequest, loadScript) {
'use strict';var _interopRequireDefault=$$$AWF$$$.common._interopRequireDefault;var _classCallCheck=$$$AWF$$$.common._classCallCheck;var _possibleConstructorReturn=$$$AWF$$$.common._possibleConstructorReturn;var _inherits=$$$AWF$$$.common._inherits;var _View2=require('GroceryList/ListItem/View');var _View3=_interopRequireDefault(_View2);var Component=(function(_View){_inherits(Component,_View);function Component(){_classCallCheck(this,Component);return _possibleConstructorReturn(this,_View.apply(this,arguments));}Component.prototype.componentWillMount = (function(){function componentWillMount(){this.model = this.props.model;this.follow(this.model,'update');}return componentWillMount;})();return Component;})(_View3['default']);exports['default'] = Component;module.exports = Component;
});
$$$AWF$$$.define("GroceryList/ListItem", function(module, exports, require, XMLHttpRequest, loadScript) {
'use strict';var _interopRequireDefault=$$$AWF$$$.common._interopRequireDefault;exports.__esModule = true;var _Component=require('GroceryList/ListItem/Component');var _Component2=_interopRequireDefault(_Component);exports['default'] = _Component2['default'];
});
$$$AWF$$$.define("GroceryList/Model", function(module, exports, require, XMLHttpRequest, loadScript) {
'use strict';var _interopRequireDefault=$$$AWF$$$.common._interopRequireDefault;var _classCallCheck=$$$AWF$$$.common._classCallCheck;var _possibleConstructorReturn=$$$AWF$$$.common._possibleConstructorReturn;var _inherits=$$$AWF$$$.common._inherits;var _Model=require('GroceryList/ListItem/Model');var _Model2=_interopRequireDefault(_Model);var _EventEmitter2=require('EventEmitter');var _EventEmitter3=_interopRequireDefault(_EventEmitter2);function _typeof(obj){return obj && typeof Symbol !== "undefined" && obj['constructor'] === Symbol?"symbol":typeof obj;}var Model=(function(_EventEmitter){_inherits(Model,_EventEmitter);function Model(){_classCallCheck(this,Model);var _this=_possibleConstructorReturn(this,_EventEmitter.call(this));_this.list = [];if(localStorage.GroceryList){var list=JSON.parse(localStorage.GroceryList);var _iter2=list;if(_iter2 && 'object' === (typeof _iter2 === 'undefined'?'undefined':_typeof(_iter2))){var _iter3=Array.isArray(_iter2)?0:Object.keys(_iter2),_iter=0,_iter4=_iter3?_iter3.length:_iter2.length;for(;_iter < _iter4;++_iter) {var item=_iter3?_iter2[_iter3[_iter]]:_iter2[_iter];item = new _Model2['default'](_this,item.text,item.crossed);_this.follow(item,'update');_this.list.push(item);}}}_this.on('update',_this.saveOnUpdate);return _this;}Model.prototype.addItem = (function(){function addItem(text){if(!text)return;var item=new _Model2['default'](this,text);this.follow(item,'update');this.list.push(item);this.emit('update');return item;}return addItem;})();Model.prototype.removeItem = (function(){function removeItem(item){for(var i=0;i < this.list.length;i++) {if(this.list[i] == item){this.list.splice(i,1);this.unfollow(item,'update');this.emit('update');break;}}}return removeItem;})();Model.prototype.saveOnUpdate = (function(){function saveOnUpdate(){localStorage.setItem("GroceryList",JSON.stringify(this.list));}return saveOnUpdate;})();return Model;})(_EventEmitter3['default']);exports['default'] = Model;module.exports = Model;
});
$$$AWF$$$.define("GroceryList/Style", function(module, exports, require, XMLHttpRequest, loadScript) {
module.exports="AQW-kVZyZQ-Style";
});
$$$AWF$$$.define("GroceryList/View", function(module, exports, require, XMLHttpRequest, loadScript) {
'use strict';var _interopRequireDefault=$$$AWF$$$.common._interopRequireDefault;var _newArrowCheck=$$$AWF$$$.common._newArrowCheck;var _classCallCheck=$$$AWF$$$.common._classCallCheck;var _possibleConstructorReturn=$$$AWF$$$.common._possibleConstructorReturn;var _inherits=$$$AWF$$$.common._inherits;exports.__esModule = true;var _UIComponent2=require('UIComponent');var _UIComponent3=_interopRequireDefault(_UIComponent2);var _Style=require('GroceryList/Style');var _Style2=_interopRequireDefault(_Style);var _ListItem=require('GroceryList/ListItem');var _ListItem2=_interopRequireDefault(_ListItem);var ViewJSX=(function(_UIComponent){_inherits(ViewJSX,_UIComponent);function ViewJSX(){_classCallCheck(this,ViewJSX);return _possibleConstructorReturn(this,_UIComponent.apply(this,arguments));}ViewJSX.prototype.render = (function(){function render(){var _this2=this;return React.createElement('div',{className:_Style2['default']},React.createElement('div',{className:'title'},'Grocery List'),React.createElement('div',{className:'list'},this.model.list.map((function(item){_newArrowCheck(this,_this2);return React.createElement(_ListItem2['default'],{key:$$$AWF$$$.common._boundProp(item,item.id),model:item});}).bind(this))),React.createElement('div',{className:'control'},React.createElement('input',{type:'text',onChange:this.bindState('input'),value:$$$AWF$$$.common._boundProp(this.state,this.state.input)}),React.createElement('button',{onClick:$$$AWF$$$.common._boundProp(this,this.addItem)},'Add')));}return render;})();return ViewJSX;})(_UIComponent3['default']);exports['default'] = ViewJSX;
});
$$$AWF$$$.define("GroceryList/Component", function(module, exports, require, XMLHttpRequest, loadScript) {
'use strict';var _interopRequireDefault=$$$AWF$$$.common._interopRequireDefault;var _classCallCheck=$$$AWF$$$.common._classCallCheck;var _possibleConstructorReturn=$$$AWF$$$.common._possibleConstructorReturn;var _inherits=$$$AWF$$$.common._inherits;var _View2=require('GroceryList/View');var _View3=_interopRequireDefault(_View2);var _Model=require('GroceryList/Model');var _Model2=_interopRequireDefault(_Model);var Component=(function(_View){_inherits(Component,_View);function Component(){_classCallCheck(this,Component);return _possibleConstructorReturn(this,_View.apply(this,arguments));}Component.prototype.componentWillMount = (function(){function componentWillMount(){this.model = new _Model2['default']();this.follow(this.model,'update');}return componentWillMount;})();Component.prototype.addItem = (function(){function addItem(){this.model.addItem(this.state.input);this.setState({input:''});}return addItem;})();return Component;})(_View3['default']);exports['default'] = Component;module.exports = Component;
});
$$$AWF$$$.define("GroceryList", function(module, exports, require, XMLHttpRequest, loadScript) {
'use strict';var _interopRequireDefault=$$$AWF$$$.common._interopRequireDefault;exports.__esModule = true;var _Component=require('GroceryList/Component');var _Component2=_interopRequireDefault(_Component);exports['default'] = _Component2['default'];
});
$$$AWF$$$.define("main", function(module, exports, require, XMLHttpRequest, loadScript) {
'use strict';var _interopRequireDefault=$$$AWF$$$.common._interopRequireDefault;var _GroceryList=require('GroceryList');var _GroceryList2=_interopRequireDefault(_GroceryList);var _UIComponent=require('UIComponent');var _UIComponent2=_interopRequireDefault(_UIComponent);_UIComponent2['default'].render(React.createElement(_GroceryList2['default'],null),document.body);
});
})();
//# sourceMappingURL=app/_build/js.map