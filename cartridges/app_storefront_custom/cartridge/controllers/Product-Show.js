/*'use strict';

var ProductMgr = require('dw/catalog/ProductMgr');
var ProductSearchModel = require('dw/catalog/ProductSearchModel');
var Template = require('dw/util/Template');

server.append('Show', function(req, res, next) {
    var product = res.getViewData().product;
    var category = product.primaryCategory ? product.primaryCategory.ID : null;

    if (category) {
        var searchModel = new ProductSearchModel();
        searchModel.setCategoryID(category);
        searchModel.search();
        var suggestedProducts = searchModel.getProductSearchHits().asList().slice(0, 4); // limit to 4 products

        res.setViewData({
            suggestedProducts: suggestedProducts
        });
    }

    next();
});*/
