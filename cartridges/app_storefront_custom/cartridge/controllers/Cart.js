'use strict';

var server = require('server');
var controller = require(module.superModule);

server.extend(controller);

server.append('MiniCartShow', function(req, res, next) {
    var viewData = res.getViewData();

    viewData.example = "One String";

    res.setViewData(viewData);

    return next();
});

module.exports = server.exports();
