const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dns = require('dns');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Force DNS to prefer IPv4
dns.setDefaultResultOrder('ipv4first');

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(morgan('dev'));

// Static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));
app.use('/api/materials', require('./routes/materialRequestRoutes'));
app.use('/api/approvals', require('./routes/approvalRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/hrms', require('./routes/hrmsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/manager', require('./routes/managerRoutes'));
app.use('/api/crm', require('./routes/crmRoutes'));
app.use('/api/erp', require('./routes/erpRoutes'));
app.use('/api/vendors', require('./routes/vendorRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/ess', require('./routes/essRoutes'));
app.use('/api/performance', require('./routes/performanceRoutes'));
app.use('/api/field-visits', require('./routes/fieldVisitRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    app.get('*', (req, res) =>
        res.sendFile(path.resolve(__dirname, '../', 'frontend', 'dist', 'index.html'))
    );
} else {
    app.get('/', (req, res) => {
        res.send('API is running...');
    });
}

// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// Connect to Database
const PORT = process.env.PORT || 5000;
app.set('io', io);

const connectDB = async () => {
    const mongoURI = process.env.MONGO_URI;
    
    try {
        await mongoose.connect(mongoURI);
        console.log('MongoDB Connected');
        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        // Fallback for querySrv ECONNREFUSED which happens on some Windows/DNS setups
        if (err.message.includes('querySrv ECONNREFUSED') && mongoURI.startsWith('mongodb+srv://')) {
            console.warn('DNS SRV resolution failed. Attempting fallback to direct connection...');
            
            try {
                // Extract credentials and host from srv uri
                // format: mongodb+srv://user:pass@host/db?opts
                const match = mongoURI.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?]+)/);
                if (match) {
                    const [_, user, pass, host] = match;
                    
                    // We use the specific shards resolved earlier for this cluster
                    // This is a targeted fix for materialtracking1.5lywonq.mongodb.net
                    if (host === 'materialtracking1.5lywonq.mongodb.net') {
                        const directURI = `mongodb://${user}:${pass}@ac-wz01xry-shard-00-00.5lywonq.mongodb.net:27017,ac-wz01xry-shard-00-01.5lywonq.mongodb.net:27017,ac-wz01xry-shard-00-02.5lywonq.mongodb.net:27017/?ssl=true&replicaSet=atlas-xqnta7-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Materialtracking1`;
                        
                        await mongoose.connect(directURI);
                        console.log('MongoDB Connected (via Fallback)');
                        httpServer.listen(PORT, () => {
                            console.log(`Server running on port ${PORT}`);
                        });
                        return;
                    }
                }
            } catch (fallbackErr) {
                console.error('Fallback connection failed:', fallbackErr);
            }
        }
        
        console.error('Database connection error:', err);
        process.exit(1);
    }
};

httpServer.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`Error: Port ${PORT} is already in use. A previous instance of the server might still be running.`);
        process.exit(1);
    }
});

connectDB();
