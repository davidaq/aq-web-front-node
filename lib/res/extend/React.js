(function() {
    var createElement = exports.createElement;
    exports.createElement = function() {
        var options = arguments[1];
        if (options && typeof options == 'object') {
            if ('if' in options) {
                var condition = options['if'];
                if (typeof condition == 'function') {
                    condition = condition();
                }
                if (!condition) {
                    return null;
                }
            }
            if (options.className)
                options.className = parseClassName(options.className);
        }
        return createElement.apply(React, arguments);
    };
    function parseClassName(cn) {
        if (typeof cn == 'object') {
            if (Array.isArray(cn)) {
                return cn.map(parseClassName).join(' ');
            } else if (cn) {
                var arr = [];
                for (var k in cn) {
                    if (cn[k]) {
                        arr.push(k);
                    }
                }
                return arr.join(' ');
            }
        }
        return cn + '';
    }
    
    
    var active = {};
    var counter = 0;
    
    var ReactComponent = exports.Component;

    $$$AWF$$$.es6._inherits(UIComponent, ReactComponent);

    function UIComponent() {
        ReactComponent.call(this);
        
        BoundObject.create(this);
        
        if (!this.state) this.state = {};
        
        var index = counter++;
        active[index] = this;
        
        var willUnmount = this.componentWillUnmount;
        var isActive = true;
        this.componentWillUnmount = function() {
            isActive = false;
            delete active[index];
            if (typeof willUnmount == 'function') {
                willUnmount.apply(this, arguments);
            }
            BoundObject(this).destroy();
        };
        var defer = null;
        BoundObject(this).listen(function(e) {
            if (BoundObject.isBoundObject(e.newValue) || BoundObject.isBoundObject(e.oldValue)) {
                if (defer)
                    clearTimeout(defer);
                defer = setTimeout(function() {
                    defer = null;
                    if (isActive)
                        e.obj.forceUpdate();
                }, 2);
            }
        });
    }

    UIComponent.activeComponents = function() {
        var ret = [];
        for (var k in active) {
            ret.push(active[k]);
        }
        return ret;
    };

    UIComponent.prototype.bindState = function(name) {
        var self = this;
        return function(e) {
            var state = {};
            state[name] = e.target.value;
            self.setState(state);
        };
    };
    
    exports.Component = UIComponent;
})();

