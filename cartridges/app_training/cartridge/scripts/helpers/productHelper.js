'use strict';

function calculateDiscountPercentage(standardPrice, salePrice) {
    if (!standardPrice || !salePrice || standardPrice <= 0 || salePrice <= 0 || salePrice >= standardPrice) {
        return null;
    }

    const discount = ((standardPrice - salePrice) / standardPrice) * 100;

    return Math.round(discount);
}

module.exports = {
    calculateDiscountPercentage: calculateDiscountPercentage
}