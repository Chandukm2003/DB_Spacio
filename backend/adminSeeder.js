const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// 1. Import your Employee model
const Employee = require('./models/Employee'); // adjust path as needed

// 2. Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// 3. Seed Admin User
const seedAdmin = async () => {
  try {
    const existingAdmin = await Employee.findOne({ email: 'admin2@example.com' });
    if (existingAdmin) {
      console.log('⚠️ Admin already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const admin = new Employee({
      name: 'Super Admin',
      email:'admin2@example.com',
      company_email: 'admin2@digitalblanket.ai',
      password_hash: hashedPassword, // changed from password to password_hash
      role: 'admin',
      department: 'Management',
    });

    await admin.save();
    console.log('✅ Admin user created successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();