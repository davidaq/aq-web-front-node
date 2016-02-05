module.exports = set;

function set(arr) {
    this.map = {};
    if (Array.isArray(arr)) {
        for (var i = 0; i < arr.length; i++)
            this.add(arr[i]);
    }
}

set.prototype.have = function(id) {
    return this.map['$$' + id];
};

set.prototype.add = function(id) {
    this.map['$$' + id] = 1;
};

set.prototype.remove = function(id) {
    delete this.map['$$' + id];
};