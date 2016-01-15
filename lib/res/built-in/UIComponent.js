$$$AWF$$$.define('UIComponent', function(module, exports, require) {
    module.exports = UIComponent;
    
    var React = require('React');

    $$$AWF$$$.es6._inherits(UIComponent, React.Component);

    function UIComponent() {
        React.Component.call(this);

        if (!this.state) this.state = {};
        var priv = this.$$$AWF$$$Private$$$UIComponent = {};
        priv.follows = [];
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
            priv.follow = false;
            if (willUnmount) {
                willUnmount.apply(this, arguments);
            }
        };
    }

    UIComponent.prototype.follow = function(emitter, evt) {
        if (!emitter) throw new Error("Followed event emitter may not be empty");
        evt = evt || 'update';
        if (emitter instanceof Array) {
            for (var i = 0; i < emitter.length; i++) {
                this.follow(emitter[i], evt);
            }
        } else if(typeof emitter.on == 'function') {
            var priv = this.$$$AWF$$$Private$$$UIComponent;
            if (!priv || !priv.follows) 
                throw new Error('Component already unmounted');
            var forceUpdate = this.forceUpdate.bind(this);
            var item = {
                emitter: emitter,
                evt: evt,
                handler: (function() {
                    try {
                        forceUpdate();
                    } catch (e) {
                        setTimeout(function() {
                            throw e;
                        }, 2);
                    }
                }).bind(this)
            };
            priv.follows.push(item);
            emitter.on(evt, item.handler);
        }
    };

    UIComponent.prototype.unfollow = function(emitter, evt) {
        var priv = this.$$$AWF$$$Private$$$UIComponent;
        if (!priv || !priv.follows)
            throw new Error('Component already unmounted');
        if (!emitter) throw new Error("Followed event emitter may not be empty");
        evt = evt || 'update';
        if (emitter instanceof Array) {
            for (var i = 0; i < emitter.length; i++) {
                this.follow(emitter[i], evt);
            }
        } else if(typeof emitter.off == 'function') {
            var follows = priv.follows;
            for (var i = follows.length - 1; i >= 0; i--) {
                var item = follows[i];
                if (item.emitter == emitter && item.evt == evt) {
                    emitter.off(evt, item.handler);
                    follows.splice(i, 1);
                }
            }
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
