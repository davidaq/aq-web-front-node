(function() {
    var createElement = exports.createElement;
    exports.createElement = function() {
        var options = arguments[1];
        if (options && typeof options == 'object') {
            if (typeof options['if'] != 'undefined') {
                var condition = options['if'];
                if (typeof condition == 'function') {
                    condition = condition();
                }
                if (!condition) {
                    return null;
                }
            }
            if (Array.isArray(options.className)) {
                options.className = options.className.join(' ');
            }
        }
        return createElement.apply(React, arguments);
    };
    
    
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
        this.componentWillUnmount = function() {
            delete active[index];
            if (typeof willUnmount == 'function') {
                willUnmount.apply(this, arguments);
            }
            BoundObject(this).destroy();
        };
        BoundObject(this).listen(function(e) {
            if (BoundObject.isBoundObject(e.newValue) || BoundObject.isBoundObject(e.oldValue))
                e.obj.forceUpdate();
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

