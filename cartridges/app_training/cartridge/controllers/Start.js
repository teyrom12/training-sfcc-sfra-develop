var server = require('server');
var ProductMgr = require('dw/catalog/ProductMgr');
var Logger = require('dw/system/Logger');

server.get('Start', function (req, res, next) {
    Logger.info('Start function is triggered'); // Log this to confirm the route is being hit

    var product = ProductMgr.getProduct('22569726M'); // Use a valid product ID here
    if (product) {
        var primaryCategory = product.getPrimaryCategory();
        if (primaryCategory) {
            Logger.info('Primary category for product: {0}', primaryCategory.getID());
        } else {
            Logger.error('No primary category found for the product!');
        }
    } else {
        Logger.error('Product not found!');
    }
    res.render('home/homepage');
    next();
});

module.exports = server.exports();
