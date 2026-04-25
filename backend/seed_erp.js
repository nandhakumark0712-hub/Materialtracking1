const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const Vendor = require('./models/Vendor');
const Order = require('./models/Order');

const seedERP = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        // Create Vendors
        const vendors = await Vendor.create([
            { name: 'Global Industrial Supplies', email: 'sales@globalind.com', phone: '1234567890', category: 'Construction', status: 'Active' },
            { name: 'Elite Hardware Sol', email: 'orders@elitehw.com', phone: '0987654321', category: 'Hardware', status: 'Active' },
            { name: 'Spark Electricals', email: 'contact@sparkelec.com', phone: '5556667777', category: 'Electrical', status: 'Active' }
        ]);

        console.log('Vendors seeded');
        
        // Create Initial Orders
        await Order.create([
            { 
                orderId: 'PO-1001', 
                vendor: vendors[0]._id, 
                items: [{ name: 'Steel Rods', quantity: 100, price: 50 }], 
                totalAmount: 5000, 
                status: 'Pending' 
            },
            { 
                orderId: 'PO-1002', 
                vendor: vendors[1]._id, 
                items: [{ name: 'Drill Bits', quantity: 50, price: 20 }], 
                totalAmount: 1000, 
                status: 'Completed' 
            }
        ]);
        
        console.log('Orders seeded');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedERP();
