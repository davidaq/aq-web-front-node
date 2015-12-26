$$$AWF$$$.define('UIComponent', function(module, exports, require) {
    module.exports = UIComponent;
    
    var React = require('React');

    $$$AWF$$$.es6._inherits(UIComponent, React.Component);

    function UIComponent() {
        React.Component.call(this);

        if (!this.state) this.state = {};
        var priv = this.$$$AWF$$$Private$$$UIComponent = {};
        priv.follows = [];
        priv.mounting = false;
        var willMount = this.componentWillMount;
        if (typeof willMount == 'function') {
            this.componentWillMount = function() {
                priv.mounting = true;
                willMount.apply(this, arguments);
                priv.mounting = false;
            };
        }
        var willUnmount = this.componentWillUnmount;
        if (typeof willUnmount != 'function') {
            willUnmount = false;
        }
        this.componentWillUnmount = function() {
            for (var i = 0; i < priv.follows.length; i++) {
                var item = priv.follows[i];
                if (typeof item.emitter.off == 'function') {
                    item.emitter.off(item.evt, item.handler);
                }
            }
            if (willUnmount) {
                willUnmount.apply(this, arguments);
            }
        };
    }

    UIComponent.prototype.follow = function(emitter, evt) {
        if (!this.$$$AWF$$$Private$$$UIComponent.mounting) {
            throw new Error("`follow` may only be called in `componentWillMount` method");
        }
        if (!emitter) throw new Error("Followed event emitter may not be empty");
        evt = evt || 'update';
        if (emitter instanceof Array) {
            for (var i = 0; i < emitter.length; i++) {
                this.follow(emitter[i], evt);
            }
        } else if(typeof emitter.on == 'function') {
            var self = this;
            var priv = this.$$$AWF$$$Private$$$UIComponent;
            var item = {
                emitter: emitter,
                evt: evt,
                handler: function() {
                    self.forceUpdate();
                }
            };
            priv.follows.push(item);
            emitter.on(evt, item.handler);
            item.handler();
        }
    };

    UIComponent.prototype.bindState = function(name) {
        var self = this;
        return function(e) {
            var state = {};
            state[name] = e.target.value;
            self.setState(state);
        };
    };
});
