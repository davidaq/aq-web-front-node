
module.exports = function(inOpt, success, reject) {
    success(
        'module.exports=' + JSON.stringify(inOpt.sourceContent) + ';',
        [[[0,0,0,0]]]
    );
};
