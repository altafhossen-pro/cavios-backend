const mongoose = require('mongoose');
require('dotenv').config();

const bcrypt = require('bcryptjs');
const { Role } = require('../modules/role/role.model');
const { User } = require('../modules/user/user.model');
const { initRoles } = require('./initRoles');

/**
 * Seed Super Admin User
 * This script:
 * 1. Initializes roles and permissions (if not already done)
 * 2. Creates a super admin user with full permissions
 * 
 * Usage:
 *   node src/scripts/seedSuperAdmin.js
 * 
 * Environment Variables (optional):
 *   SUPER_ADMIN_EMAIL=admin@cavios.com
 *   SUPER_ADMIN_PASSWORD=Admin@123
 *   SUPER_ADMIN_NAME=Super Admin
 */
const seedSuperAdmin = async () => {
  try {
    console.log('🚀 Starting Super Admin user seeding...\n');

    // Connect to database
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gold-ecommerce';
    await mongoose.connect(dbUri);
    console.log('✅ Connected to database\n');

    // Step 1: Initialize roles and permissions (if not already done)
    console.log('📋 Checking roles and permissions...');
    const existingRoles = await Role.find({ isActive: true });
    
    if (existingRoles.length === 0) {
      console.log('⚠️  No roles found. Initializing roles and permissions...\n');
      await initRoles();
      console.log('✅ Roles and permissions initialized\n');
    } else {
      console.log(`✅ Found ${existingRoles.length} existing roles\n`);
    }

    // Step 2: Get Super Admin role
    const superAdminRole = await Role.findOne({ isSuperAdmin: true });
    
    if (!superAdminRole) {
      console.error('❌ Super Admin role not found! Please run "npm run init:roles" first.');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log(`✅ Found Super Admin role: ${superAdminRole.name} (${superAdminRole._id})\n`);

    // Step 3: Get admin credentials from environment or use defaults
    const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@cavios.com';
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123';
    const adminName = process.env.SUPER_ADMIN_NAME || 'Super Admin';

    // Step 4: Check if super admin user already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: adminEmail.toLowerCase() },
        { roleId: superAdminRole._id }
      ]
    });

    if (existingAdmin) {
      console.log('⚠️  Super Admin user already exists!\n');
      console.log('📋 Existing Admin Details:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Role ID: ${existingAdmin.roleId}`);
      console.log(`   Status: ${existingAdmin.status}\n`);

      // Check if role is assigned correctly
      if (existingAdmin.roleId?.toString() !== superAdminRole._id.toString()) {
        console.log('⚠️  Admin user exists but doesn\'t have Super Admin role assigned.');
        console.log('   Updating role...\n');
        existingAdmin.roleId = superAdminRole._id;
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Role updated successfully!\n');
      }

      console.log('ℹ️  To create a new super admin, use a different email or delete the existing one.\n');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Step 5: Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log('✅ Password hashed\n');

    // Step 6: Create super admin user
    console.log('👤 Creating Super Admin user...');
    const superAdmin = new User({
      name: adminName,
      email: adminEmail.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
      roleId: superAdminRole._id,
      status: 'active',
      emailVerified: true,
      phoneVerified: false,
      registerType: 'email',
    });

    await superAdmin.save();
    console.log('✅ Super Admin user created successfully!\n');

    // Step 7: Display summary
    console.log('📊 Super Admin User Details:');
    console.log('━'.repeat(50));
    console.log(`   Name: ${superAdmin.name}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Password: ${adminPassword} (Please change this after first login!)`);
    console.log(`   Role: ${superAdmin.role}`);
    console.log(`   Role ID: ${superAdmin.roleId}`);
    console.log(`   Status: ${superAdmin.status}`);
    console.log(`   Permissions: Full (Super Admin has all permissions)\n`);

    console.log('✅ Super Admin seeding completed!\n');
    console.log('📝 Next steps:');
    console.log('   1. Login to the admin dashboard using the credentials above');
    console.log('   2. Change the password immediately after first login');
    console.log('   3. Create additional admin users if needed\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding super admin:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedSuperAdmin();
}

module.exports = { seedSuperAdmin };

