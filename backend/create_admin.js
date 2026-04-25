const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const createAdmin = async () => {
    const mongoURI = process.env.MONGO_URI;
    
    try {
        console.log('Attempting to connect to MongoDB...');
        try {
            await mongoose.connect(mongoURI);
        } catch (err) {
            if (err.message.includes('querySrv ECONNREFUSED')) {
                 console.log('DNS issue detected, using direct shard fallback...');
                 const directURI = `mongodb://nandhakumark0712_db_user:C1zvi85yGKew81nF@ac-wz01xry-shard-00-00.5lywonq.mongodb.net:27017,ac-wz01xry-shard-00-01.5lywonq.mongodb.net:27017,ac-wz01xry-shard-00-02.5lywonq.mongodb.net:27017/?ssl=true&replicaSet=atlas-xqnta7-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Materialtracking1`;
                 await mongoose.connect(directURI);
            } else {
                throw err;
            }
        }
        
        console.log('Connected to MongoDB');

        const existingAdmin = await User.findOne({ username: 'Admin' });
        if (existingAdmin) {
            console.log('Admin already exists. Updating password...');
            existingAdmin.password = 'admin123';
            await existingAdmin.save();
            console.log('Admin password updated to admin123');
        } else {
            await User.create({
                name: 'System Admin',
                username: 'Admin',
                password: 'admin123',
                role: 'Admin',
                email: 'admin@system.com'
            });
            console.log('Admin user created successfully!');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error creating admin:', err.message);
        process.exit(1);
    }
};

createAdmin();
