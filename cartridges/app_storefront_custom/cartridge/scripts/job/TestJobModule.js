'use strict';

/* API includes */
var Status = require('dw/system/Status');
var Logger = require('dw/system/Logger');
/**
 * Generate Log as an example for Hello World.
 * @input firstParam : String - First BM parameter.
 * @input secondParam : String - Second BM parameter.
 * @input firstParam : String - Third BM parameter.
 * @param {dw.util.HashMap} args which contain {firstParam, secondParam, thirdParam} parameters.
 * @returns {dw.system.Status} - job status
 */

function execute(args) {
    if (empty(args.firstParam || args.secondParam || args.thirdParam)) {
        Logger.error("Please set the following parameters (firstParam, secondParam, thirdParam)");
        return new Status(Status.ERROR, "ERROR");
    }

    var statusOK = true;

    try {
        Logger.info("Your script parameters are: {0} {1} {2} !", args.firstParam, args.secondParam, args.thirdParam);
        statusOK = true;
    } catch (error) {
        statusOK = false;
        Logger.error(error.message);
    }

    if (statusOK) {
        return new Status(Status.OK, "OK");
    } else {
        return new Status(Status.ERROR, "ERROR");
    }
}

exports.execute = execute;
