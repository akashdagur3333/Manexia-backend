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
const authMiddleware = require('../../shared/middlewares/auth.middleware');

// Category
router.post('/category',authMiddleware, category.create);
router.get('/category',authMiddleware, category.list);
router.delete('/category/:id',authMiddleware, category.remove);

// Unit
router.post('/unit',authMiddleware, unit.create);
router.get('/unit',authMiddleware, unit.list);
router.delete('/unit/:id',authMiddleware, unit.remove);

// Quantity
router.post('/quantity',authMiddleware, quantity.create);
router.get('/quantity',authMiddleware, quantity.list);
router.delete('/quantity/:id',authMiddleware, quantity.remove);

// Material
router.post('/material',authMiddleware, material.create);
router.get('/material',authMiddleware, material.list);
router.put('/material/:id',authMiddleware, material.update);
router.delete('/material/:id',authMiddleware, material.remove);

// Stock
router.post('/stocks/in', authMiddleware, stock.stockIn);
router.post('/stocks/reserve', authMiddleware, stock.reserve);
router.post('/stocks/release', authMiddleware, stock.release);
router.post('/stocks/consume', authMiddleware, stock.consume);
router.get('/stocks/', authMiddleware, stock.list);

// Stock Usage
router.post('/stock-usage',authMiddleware, usage.create);
router.get('/stock-usage',authMiddleware, usage.list);

// Vendor
router.post('/vendor',authMiddleware, vendor.create);
router.get('/vendor',authMiddleware, vendor.list);
router.delete('/vendor/:id',authMiddleware, vendor.remove);

// Vendor Order
router.post('/vendor-order',authMiddleware, vendorOrder.create);
router.get('/vendor-order',authMiddleware, vendorOrder.list);

// Vendor Invoice
router.post('/vendor-invoice',authMiddleware, vendorInvoice.create);
router.get('/vendor-invoice',authMiddleware, vendorInvoice.list);

// Customer
router.post('/customer',authMiddleware, customer.create);
router.get('/customer',authMiddleware, customer.list);
router.delete('/customer/:id',authMiddleware, customer.remove);

// Customer Order
router.post('/customer-order',authMiddleware, customerOrder.create);
router.get('/customer-order',authMiddleware, customerOrder.list);

// Customer Invoice
router.post('/customer-invoice',authMiddleware, customerInvoice.create);
router.get('/customer-invoice',authMiddleware, customerInvoice.list);

// Warehouse
router.post('/warehouse',authMiddleware, warehouse.create);
router.get('/warehouse',authMiddleware, warehouse.list);
router.put('/warehouse/:id',authMiddleware, warehouse.update);
router.delete('/warehouse/:id',authMiddleware, warehouse.remove);

// Warehouse Order
router.post('/warehouse-order',authMiddleware, warehouseOrder.create);
router.get('/warehouse-order',authMiddleware, warehouseOrder.list);
router.put('/warehouse-order/:id',authMiddleware, warehouseOrder.update);
router.delete('/warehouse-order/:id',authMiddleware, warehouseOrder.remove);
router.get('/warehouse-order/approval/:id',authMiddleware, warehouseOrder.approve);

// Reports
router.get('/report/current-stock',authMiddleware, report.currentStock);
router.get('/report/purchase',authMiddleware, report.purchaseReport);
router.get('/report/sales',authMiddleware, report.salesReport);
module.exports = router;
