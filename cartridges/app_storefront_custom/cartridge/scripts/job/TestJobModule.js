var Status = require('dw/system/Status');
var OrderMgr = require('dw/order/OrderMgr');
var FileWriter = require('dw/io/FileWriter');
var CSVStreamWriter = require('dw/io/CSVStreamWriter');
var File = require('dw/io/File');
var Transaction = require('dw/system/Transaction');

/**
 * Main function for the job.
 * @param {dw.job.JobStepExecution} jobStepExecution
 * @param {Object} parameters - Passed parameters (firstParam, secondParam, thirdParam)
 * @returns {dw.system.Status}
 */
function execute(jobStepExecution, parameters) {

    try {
        // Start a transaction (if necessary)
        Transaction.wrap(function () {
            // Fetch orders to process
            var orderIterator = OrderMgr.searchOrders("status = {0}", "creationDate desc", dw.order.Order.ORDER_STATUS_NEW);
            
            // Create a CSV file
            var file = new File(File.IMPEX + '/src/order_export.csv');
            var fileWriter = new FileWriter(file);
            var csvWriter = new CSVStreamWriter(fileWriter);

            // Write CSV headers
            csvWriter.writeNext(['Order No', 'Customer Name', 'Total Price']);

            // Iterate through the orders and write them to the CSV
            while (orderIterator.hasNext()) {
                var order = orderIterator.next();
                csvWriter.writeNext([
                    order.orderNo,
                    order.customerName,
                    order.totalGrossPrice.value
                ]);
            }

            // Close the CSV writer
            csvWriter.close();
            fileWriter.close();
        });

        // Return OK status after successful execution
        return new Status(Status.OK, 'OK', 'Job executed successfully');
    } catch (e) {
        // Log the error and return ERROR status
        dw.system.Logger.error('Error occurred during the job execution: ' + e.toString());
        return new Status(Status.ERROR, 'ERROR', 'Job execution failed');
    }
}

exports.execute = execute;
