const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config({ path: '../.env' });

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const email = 'admin.rewear@gmail.com';
  const username = 'admin';
  const password = 'Admin@1234';

  // Check if admin already exists
  const exists = await Admin.findOne({ email });
  if (exists) {
    console.log('Admin already exists:', exists.email);
    process.exit(0);
  }

  const admin = new Admin({
    username,
    email,
    password,
    role: 'admin',
  });

  await admin.save();
  console.log('Admin created:', { username, email, password });
  process.exit(0);
}

createAdmin().catch(err => {
  console.error('Error creating admin:', err);
  process.exit(1);
});
