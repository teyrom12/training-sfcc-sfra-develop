'use strict';

var server = require('server');

server.get('HelloWorld', function (req, res, next) {
    // This will handle requests to the HelloWorld route
    res.render('training/myfirsttemplate');
    return next();
});

module.exports = server.exports();
