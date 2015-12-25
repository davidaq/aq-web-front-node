exports.createElement = (function(createElement) {
    return function() {
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
})(exports.createElement);
