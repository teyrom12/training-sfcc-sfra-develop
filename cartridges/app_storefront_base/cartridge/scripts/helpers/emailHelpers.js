'use strict';

/**
 * Helper that sends an email to a customer. This will only get called if hook handler is not registered.
 * @param {obj} emailObj - An object that contains information about the email that will be sent.
 * @param {string} emailObj.to - Email address to send the message to (required).
 * @param {string} emailObj.subject - Subject of the message to be sent (required).
 * @param {string} emailObj.from - Email address to be used as a "from" address in the email (required).
 * @param {int} emailObj.type - Integer that specifies the type of the email being sent out. See export from emailHelpers for values.
 * @param {string} template - Location of the ISML template to be rendered in the email.
 * @param {obj} context - Object with context to be passed as pdict into ISML template.
 */
function send(emailObj, template, context) {
    var Mail = require('dw/net/Mail');
    var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');

    var email = new Mail();
    email.addTo(emailObj.to);
    email.setSubject(emailObj.subject);
    email.setFrom(emailObj.from);
    email.setContent(renderTemplateHelper.getRenderedHtml(context, template), 'text/html', 'UTF-8');
    email.send();
}

/**
 * Checks if the email value entered is in the correct format.
 * @param {string} email - Email string to check if valid.
 * @returns {boolean} Whether the email is valid.
 */
function validateEmail(email) {
    var regex = /^[\w.%+-]+@[\w.-]+\.\w{2,}$/;
    return regex.test(email);
}

/**
 * Sends the cart notification email to the customer.
 * This utilizes the emailTypes.cartNotification type.
 * @param {string} customerEmail - The recipient's email address.
 * @param {string} customerFirstName - The customer's first name.
 * @param {Array} productList - List of products in the cart.
 */
function sendCartNotification(customerEmail, customerFirstName, productList) {
    var Site = require('dw/system/Site');
    var emailObj = {
        to: customerEmail,
        subject: 'Your Cart Summary',
        from: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'noreply@yourstore.com',
        type: emailTypes.cartNotification
    };
    
    var context = {
        CustomerFirstName: customerFirstName,
        productList: productList
    };

    // Send the cart notification email using the cartEmailNotification template
    send(emailObj, 'cartEmailNotification.isml', context);
}

module.exports = {
    send: send,
    sendCartNotification: sendCartNotification, // Exposing cart notification function
    sendEmail: function (emailObj, template, context) {
        var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
        return hooksHelper('app.customer.email', 'sendEmail', [emailObj, template, context], send);
    },
    emailTypes: {
        registration: 1,
        passwordReset: 2,
        passwordChanged: 3,
        orderConfirmation: 4,
        accountLocked: 5,
        accountEdited: 6,
        cartNotification: 7 // Cart notification email type
    },
    validateEmail: validateEmail
};
