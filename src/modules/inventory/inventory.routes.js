const router = require('express').Router();
const category=require('./controller/inventoryCategory.controller');
const unit = require('./controller/inventoryUnit.controller');
const quantity = require('./controller/inventoryQuantity.controller');
const material = require('./row-material/controller/material.controller');
const stock = require('./row-material/controller/materialStock.controller');
const usage = require('./row-material/controller/materialStockUsage.controller');

const vendor = require('./vendor/controller/vendor.controller');
const vendorOrder = require('./vendor/controller/vendorOrder.controller');
const vendorInvoice = require('./vendor/controller/vendorInvoice.controller');

const customer = require('./customer/controller/customer.controller');
const customerOrder = require('./customer//controller/customerOrder.controller');
const customerInvoice = require('./customer//controller/customerInvoice.controller');

const warehouse = require('./warehouse/controller/warehouse.controller');
const warehouseOrder = require('./warehouse/controller/warehouseOrder.controller');

const report = require('./reports/inventoryReport.controller');

// Category
router.post('/category', category.create);
router.get('/category', category.list);
router.delete('/category/:id', category.remove);

// Unit
router.post('/unit', unit.create);
router.get('/unit', unit.list);
router.delete('/unit/:id', unit.remove);

// Quantity
router.post('/quantity', quantity.create);
router.get('/quantity', quantity.list);
router.delete('/quantity/:id', quantity.remove);

// Material
router.post('/material', material.create);
router.get('/material', material.list);
router.delete('/material/:id', material.remove);

// Stock
router.post('/stock', stock.addOrUpdate);
router.get('/stock', stock.list);

// Stock Usage
router.post('/stock-usage', usage.create);
router.get('/stock-usage', usage.list);

// Vendor
router.post('/vendor', vendor.create);
router.get('/vendor', vendor.list);
router.delete('/vendor/:id', vendor.remove);

// Vendor Order
router.post('/vendor-order', vendorOrder.create);
router.get('/vendor-order', vendorOrder.list);

// Vendor Invoice
router.post('/vendor-invoice', vendorInvoice.create);
router.get('/vendor-invoice', vendorInvoice.list);

// Customer
router.post('/customer', customer.create);
router.get('/customer', customer.list);
router.delete('/customer/:id', customer.remove);

// Customer Order
router.post('/customer-order', customerOrder.create);
router.get('/customer-order', customerOrder.list);

// Customer Invoice
router.post('/customer-invoice', customerInvoice.create);
router.get('/customer-invoice', customerInvoice.list);

// Warehouse
router.post('/warehouse', warehouse.create);
router.get('/warehouse', warehouse.list);
router.delete('/warehouse/:id', warehouse.remove);

// Warehouse Order
router.post('/warehouse-order', warehouseOrder.create);
router.get('/warehouse-order', warehouseOrder.list);

// Reports
router.get('/report/current-stock', report.currentStock);
router.get('/report/purchase', report.purchaseReport);
router.get('/report/sales', report.salesReport);
module.exports = router;
