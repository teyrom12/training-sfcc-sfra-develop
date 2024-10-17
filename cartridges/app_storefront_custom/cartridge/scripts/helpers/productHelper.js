/**
* Calculates the discount percentage based on the standard and sale prices.
* 
* This function determines the percentage discount given a standard price and a sale price.
* It returns `null` if any of the following conditions are met:
* - Either `standardPrice` or `salePrice` is not provided.
* - Either `standardPrice` or `salePrice` is less than or equal to zero.
* - `salePrice` is greater than or equal to `standardPrice`.
* 
* Otherwise, it calculates the discount percentage using the formula:
* `((standardPrice - salePrice) / standardPrice) * 100` and returns the result rounded to the nearest integer.
*
* @param {number} standardPrice - The original price of the product before any discounts.
* @param {number} salePrice - The discounted price of the product.
* @returns {number|null} The discount percentage rounded to the nearest integer, or `null` if the input conditions are not met.
*/
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