var ProductMgr = require('dw/catalog/ProductMgr');
var CategoryMgr = require('dw/catalog/CategoryMgr');
var File = require('dw/io/File');
var FileWriter = require('dw/io/FileWriter');
var XMLStreamWriter = require('dw/io/XMLStreamWriter');
var Status = require('dw/system/Status');
var Transaction = require('dw/system/Transaction');
var Logger = require('dw/system/Logger');

/**
 * Job to assign products of a certain brand to a specific category.
 *
 * @param {Object} jobStepExecution - Job step execution context.
 * @param {Object} parameters - Job parameters (brand and category).
 * @returns {Status}
 */
function execute(jobStepExecution, parameters) {
    var brand = parameters.brandParam;
    var categoryID = parameters.categoryParam;

    try {
        Transaction.wrap(function () {
            // Get the category to assign products to
            var category = CategoryMgr.getCategory(categoryID);
            if (!category) {
                Logger.error('Category not found: {0}', categoryID);
                throw new Error('Category not found: ' + categoryID);
            }

            // Open an XML file to write product assignments
            var file = new File(File.IMPEX + '/assignments.xml');
            var fileWriter = new FileWriter(file);
            var writer = new XMLStreamWriter(fileWriter);

            writer.writeStartDocument();
            writer.writeStartElement('ProductAssignments');

            // Search for all products by brand
            var productIterator = ProductMgr.queryProductsInCatalog('brand = {0}', brand);

            if (!productIterator.hasNext()) {
                Logger.error('No products found for brand: {0}', brand);
                throw new Error('No products found for brand: ' + brand);
            }

            try {
                while (productIterator.hasNext()) {
                    var product = productIterator.next();

                    // Write the product assignment to the XML
                    writer.writeStartElement('Assignment');
                    writer.writeElement('ProductID', product.ID);
                    writer.writeElement('CategoryID', categoryID);
                    writer.writeEndElement();
                }
            } finally {
                productIterator.close();
            }

            writer.writeEndElement(); // Close ProductAssignments
            writer.writeEndDocument();
            writer.flush();
            writer.close();
            fileWriter.close();

            // Log success and set job step execution status
            Logger.info('Products for brand {0} successfully assigned to category {1}', brand, categoryID);
            jobStepExecution.setStatus(Status.OK);
        });

        return new Status(Status.OK, 'OK', 'Job executed successfully');
    } catch (e) {
        // Log the error and set the job step status to ERROR
        Logger.error('Error occurred during the job execution: ' + e.toString());
        jobStepExecution.setStatus(Status.ERROR);
        return new Status(Status.ERROR, 'ERROR', 'Job execution failed');
    }
}

exports.execute = execute;
