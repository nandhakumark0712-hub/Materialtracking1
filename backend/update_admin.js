const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');

const updateAdmin = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        
        const oldAdmin = await User.findOne({ email: 'admin@example.com' });
        if (oldAdmin) {
            oldAdmin.email = 'admin@gmail.com';
            await oldAdmin.save();
            console.log('Admin email updated to admin@gmail.com');
        } else {
            console.log('Admin not found with admin@example.com');
            // Try creating it
            const exists = await User.findOne({ email: 'admin@gmail.com' });
            if (!exists) {
                await User.create({
                    name: 'Main Admin',
                    email: 'admin@gmail.com',
                    password: 'password123',
                    role: 'Admin'
                });
                console.log('Admin created with admin@gmail.com');
            } else {
                console.log('Admin admin@gmail.com already exists');
            }
        }
        process.exit(0);
    } catch (error) {
        console.error('FAILED UPDATE:', error.message);
        process.exit(1);
    }
};

updateAdmin();
