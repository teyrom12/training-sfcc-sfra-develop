var Status = require('dw/system/Status');
var OrderMgr = require('dw/order/OrderMgr');
var FileWriter = require('dw/io/FileWriter');
var CSVStreamWriter = require('dw/io/CSVStreamWriter');
var File = require('dw/io/File');
var Transaction = require('dw/system/Transaction');


/**
* Executes a job step to export new orders to a CSV file.
*
* This function searches for orders with a status of 'new', writes their details
* to a CSV file, and handles any errors that occur during the process.
*
* @param {Object} jobStepExecution - The context of the job step execution.
* @param {Object} parameters - The parameters provided for the job execution.
* @returns {dw.system.Status} - The status of the job execution, indicating success or failure.
*
* @throws {Error} If an error occurs during the transaction, it is logged and a failure status is returned.
*
* @example
* // Example usage:
* var status = execute(jobStepExecution, parameters);
* if (status.isError()) {
*     // Handle error
* }
*/
function execute(jobStepExecution, parameters) {
    try {
        Transaction.wrap(function () {
            var orderIterator = OrderMgr.searchOrders("status = {0}", "creationDate desc", dw.order.Order.ORDER_STATUS_NEW);
            
            var file = new File(File.IMPEX + '/src/order_export.csv');
            var fileWriter = new FileWriter(file);
            var csvWriter = new CSVStreamWriter(fileWriter);

            csvWriter.writeNext(['Order No', 'Customer Name', 'Total Price']);

            while (orderIterator.hasNext()) {
                var order = orderIterator.next();
                csvWriter.writeNext([
                    order.orderNo,
                    order.customerName,
                    order.totalGrossPrice.value
                ]);
            }
            csvWriter.close();
            fileWriter.close();
        });

        return new Status(Status.OK, 'OK', 'Job executed successfully');
    } catch (e) {

        dw.system.Logger.error('Error occurred during the job execution: ' + e.toString());
        return new Status(Status.ERROR, 'ERROR', 'Job execution failed');
    }
}

exports.execute = execute;
