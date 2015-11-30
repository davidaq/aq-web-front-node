$$$AWF$$$.define('View', function(module, exports, require) {
    module.exports = View;

    $$$AWF$$$.common._inherits(View, React.Component);

    function View() {
        React.Component.call(this);

        var priv = this.$$$AWF$$$Private$$$View = {};
        priv.follows = [];
        priv.mounting = false;
        var didMount = this.componentDidMount;
        if (typeof didMount == 'function') {
            this.componentDidMount = function() {
                priv.mounting = true;
                didMount.apply(this, arguments);
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

    View.prototype.follow = function(emitter, evt) {
        if (!this.$$$AWF$$$Private$$$View.mounting) {
            throw new Error("follow can only be called in `componentDidMount` method");
        }
        if (!emitter) {
            throw new Error("Followed event emitter may not be empty");
        }
        if (!evt) {
            throw new Error("Followed event may not be empty");
        }
        if (emitter instanceof Array) {
            for (var i = 0; i < emitter.length; i++) {
                this.follow(emitter[i], evt);
            }
        } else if(typeof emitter.on == 'function') {
            var self = this;
            var priv = this.$$$AWF$$$Private$$$View;
            var item = {
                emitter: emitter,
                evt: evt,
                handler: function() {
                    var update = {};
                    for (var k in emitter) {
                        if (k.substr(0, 19) != '$$$AWF$$$Private$$$') {
                            update[k] = emitter[k];
                        }
                    }
                    self.setState(update);
                }
            };
            priv.follows.push(item);
            emitter.on(evt, item.handler);
        }
    };
});
