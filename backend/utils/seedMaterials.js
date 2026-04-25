const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Material = require('../models/Material');
const User = require('../models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const materials = [
  {
    name: 'Industrial Cable (50m)',
    sku: 'CAB-001',
    category: 'Row Material',
    quantity: 120,
    unit: 'meters',
    lowStockThreshold: 20
  },
  {
    name: 'Aluminum Enclosure',
    sku: 'ENC-002',
    category: 'Finished Goods',
    quantity: 45,
    unit: 'units',
    lowStockThreshold: 10
  },
  {
    name: 'Drilling Tool Set',
    sku: 'TOOL-003',
    category: 'Tools',
    quantity: 15,
    unit: 'sets',
    lowStockThreshold: 5
  },
  {
    name: 'Fiber Optic Patch Cord',
    sku: 'FIB-004',
    category: 'Row Material',
    quantity: 200,
    unit: 'pcs',
    lowStockThreshold: 50
  }
];

const seedMaterials = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');

    const admin = await User.findOne({ role: 'Admin' });
    if (!admin) {
        console.error('Please run seedUsers first to create an admin.');
        process.exit(1);
    }

    // Clear existing materials
    await Material.deleteMany();
    console.log('Existing materials removed');

    // Add createdBy field
    const materialsWithAdmin = materials.map(m => ({
        ...m,
        createdBy: admin._id
    }));

    // Create materials
    await Material.create(materialsWithAdmin);
    console.log(`${materials.length} materials seeded successfully`);

    process.exit();
  } catch (error) {
    console.error('Error seeding materials:', error);
    process.exit(1);
  }
};

seedMaterials();
