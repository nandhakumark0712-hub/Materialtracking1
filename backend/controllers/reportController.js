const Material = require('../models/Material');
const Order = require('../models/Order');
const Deal = require('../models/Deal');
const PurchaseRequest = require('../models/PurchaseRequest');
const { Parser } = require('json2csv');

// @desc    Export Inventory Report
// @route   GET /api/reports/inventory
exports.exportInventory = async (req, res, next) => {
    try {
        const materials = await Material.find().populate('createdBy', 'name');
        const fields = ['name', 'sku', 'category', 'quantity', 'unit', 'lowStockThreshold', 'status'];
        const json2csv = new Parser({ fields });
        const csv = json2csv.parse(materials);
        
        res.header('Content-Type', 'text/csv');
        res.attachment('inventory_report.csv');
        return res.send(csv);
    } catch (err) {
        next(err);
    }
};

// @desc    Export Sales Report
// @route   GET /api/reports/sales
exports.exportSales = async (req, res, next) => {
    try {
        const deals = await Deal.find({ status: 'Won' }).populate('customer', 'name').populate('assignedTo', 'name');
        const fields = [
            { label: 'Deal Title', value: 'title' },
            { label: 'Customer', value: 'customer.name' },
            { label: 'Value', value: 'value' },
            { label: 'Sales Agent', value: 'assignedTo.name' },
            { label: 'Date', value: 'createdAt' }
        ];
        const json2csv = new Parser({ fields });
        const csv = json2csv.parse(deals);
        
        res.header('Content-Type', 'text/csv');
        res.attachment('sales_report.csv');
        return res.send(csv);
    } catch (err) {
        next(err);
    }
};

// @desc    Export Procurement Report
// @route   GET /api/reports/procurement
exports.exportProcurement = async (req, res, next) => {
    try {
        const orders = await Order.find().populate('vendor', 'name');
        const fields = [
            { label: 'Order ID', value: 'orderID' },
            { label: 'Vendor', value: 'vendor.name' },
            { label: 'Amount', value: 'totalAmount' },
            { label: 'Status', value: 'status' },
            { label: 'Date', value: 'createdAt' }
        ];
        const json2csv = new Parser({ fields });
        const csv = json2csv.parse(orders);
        
        res.header('Content-Type', 'text/csv');
        res.attachment('procurement_report.csv');
        return res.send(csv);
    } catch (err) {
        next(err);
    }
};
