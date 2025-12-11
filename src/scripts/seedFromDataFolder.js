const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { Division, District, Upazila, DhakaCity } = require('../modules/address/address.model');

/**
 * Seed Data from JSON Files in Data Folder
 * This script reads JSON files from the data folder and seeds them into the database
 * 
 * Usage:
 *   node src/scripts/seedFromDataFolder.js
 *   node src/scripts/seedFromDataFolder.js --reset  (clears existing data first)
 *   node src/scripts/seedFromDataFolder.js --file=divisions.json  (seed specific file)
 * 
 * Supported file patterns:
 *   - gold-ecommerce.divisions.json -> Division model
 *   - gold-ecommerce.districts.json -> District model
 *   - gold-ecommerce.upazilas.json -> Upazila model
 *   - gold-ecommerce.dhakacities.json -> DhakaCity model
 */

// File to model mapping
const FILE_MODEL_MAP = {
  'gold-ecommerce.divisions.json': { model: Division, name: 'Division' },
  'gold-ecommerce.districts.json': { model: District, name: 'District' },
  'gold-ecommerce.upazilas.json': { model: Upazila, name: 'Upazila' },
  'gold-ecommerce.dhakacities.json': { model: DhakaCity, name: 'DhakaCity' },
};

// Address files only (for address-specific seeding)
const ADDRESS_FILES = [
  'gold-ecommerce.divisions.json',
  'gold-ecommerce.districts.json',
  'gold-ecommerce.upazilas.json',
  'gold-ecommerce.dhakacities.json',
];

// Order of seeding (respects dependencies)
const SEED_ORDER = [
  'gold-ecommerce.divisions.json',
  'gold-ecommerce.districts.json',
  'gold-ecommerce.upazilas.json',
  'gold-ecommerce.dhakacities.json',
];

/**
 * Convert MongoDB ObjectId format to plain object
 */
const convertObjectId = (obj) => {
  if (obj && typeof obj === 'object') {
    if (obj.$oid) {
      return new mongoose.Types.ObjectId(obj.$oid);
    }
    if (Array.isArray(obj)) {
      return obj.map(convertObjectId);
    }
    const converted = {};
    for (const key in obj) {
      converted[key] = convertObjectId(obj[key]);
    }
    return converted;
  }
  return obj;
};

/**
 * Read and parse JSON file
 */
const readJsonFile = (filePath) => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    throw new Error(`Error reading file ${filePath}: ${error.message}`);
  }
};

/**
 * Seed a single file
 */
const seedFile = async (fileName, { model, name }, shouldReset = false) => {
  const dataFolder = path.join(__dirname, '../../data');
  const filePath = path.join(dataFolder, fileName);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${fileName}, skipping...`);
    return { success: false, count: 0, skipped: true };
  }

  console.log(`\n📄 Processing ${fileName}...`);

  try {
    // Read JSON data
    const jsonData = readJsonFile(filePath);
    console.log(`   Found ${jsonData.length} records in file`);

    // Reset if requested
    if (shouldReset) {
      const deletedCount = await model.deleteMany({});
      console.log(`   🗑️  Deleted ${deletedCount.deletedCount} existing ${name} records`);
    }

    // Convert ObjectIds and prepare data
    const records = jsonData.map((item) => {
      const converted = convertObjectId(item);
      // Remove _id if it exists (let MongoDB generate new ones)
      delete converted._id;
      return converted;
    });

    // Insert records
    let insertedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (const record of records) {
      try {
        // Use upsert based on unique identifier
        let query = {};
        if (record.id) {
          query.id = record.id;
        } else if (record.name) {
          query.name = record.name;
        }

        if (Object.keys(query).length > 0) {
          const result = await model.findOneAndUpdate(
            query,
            { $set: record },
            { upsert: true, new: true }
          );
          if (result.isNew) {
            insertedCount++;
          } else {
            updatedCount++;
          }
        } else {
          // No unique identifier, just insert
          await model.create(record);
          insertedCount++;
        }
      } catch (error) {
        errorCount++;
        console.error(`   ❌ Error inserting record: ${error.message}`);
      }
    }

    console.log(`   ✅ ${name}: ${insertedCount} inserted, ${updatedCount} updated, ${errorCount} errors`);
    return { success: true, count: insertedCount + updatedCount, insertedCount, updatedCount, errorCount };
  } catch (error) {
    console.error(`   ❌ Error seeding ${fileName}: ${error.message}`);
    return { success: false, count: 0, error: error.message };
  }
};

/**
 * Main seeding function
 */
const seedFromDataFolder = async () => {
  try {
    console.log('🚀 Starting data seeding from JSON files...\n');

    // Connect to database
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gold-ecommerce';
    await mongoose.connect(dbUri);
    console.log('✅ Connected to database');

    // Check for flags
    const shouldReset = process.argv.includes('--reset');
    const addressOnly = process.argv.includes('--address-only');
    const fileArg = process.argv.find(arg => arg.startsWith('--file='));
    const specificFile = fileArg ? fileArg.split('=')[1] : null;

    if (shouldReset) {
      console.log('⚠️  --reset flag detected: Existing data will be cleared before seeding\n');
    }

    if (addressOnly) {
      console.log('📍 --address-only flag detected: Only address data will be seeded\n');
    }

    if (specificFile) {
      console.log(`📌 Seeding specific file: ${specificFile}\n`);
    }

    // Determine which files to seed
    let filesToSeed = SEED_ORDER;
    if (addressOnly) {
      // Only seed address files
      filesToSeed = ADDRESS_FILES;
    } else if (specificFile) {
      if (!FILE_MODEL_MAP[specificFile]) {
        console.error(`❌ Unknown file: ${specificFile}`);
        console.log(`   Available files: ${Object.keys(FILE_MODEL_MAP).join(', ')}`);
        await mongoose.connection.close();
        process.exit(1);
      }
      filesToSeed = [specificFile];
    }

    // Seed files in order
    const results = {};
    for (const fileName of filesToSeed) {
      if (FILE_MODEL_MAP[fileName]) {
        const result = await seedFile(fileName, FILE_MODEL_MAP[fileName], shouldReset);
        results[fileName] = result;
      } else {
        console.log(`⚠️  No model mapping found for ${fileName}, skipping...`);
      }
    }

    // Summary
    console.log('\n' + '━'.repeat(60));
    console.log('📊 Seeding Summary:');
    console.log('━'.repeat(60));

    let totalInserted = 0;
    let totalUpdated = 0;
    let totalErrors = 0;

    Object.keys(results).forEach((fileName) => {
      const result = results[fileName];
      if (result.skipped) {
        console.log(`   ⚠️  ${fileName}: Skipped (file not found)`);
      } else if (result.success) {
        console.log(`   ✅ ${fileName}: ${result.insertedCount || 0} inserted, ${result.updatedCount || 0} updated, ${result.errorCount || 0} errors`);
        totalInserted += result.insertedCount || 0;
        totalUpdated += result.updatedCount || 0;
        totalErrors += result.errorCount || 0;
      } else {
        console.log(`   ❌ ${fileName}: Failed - ${result.error || 'Unknown error'}`);
        totalErrors++;
      }
    });

    console.log('━'.repeat(60));
    console.log(`   Total: ${totalInserted} inserted, ${totalUpdated} updated, ${totalErrors} errors`);
    console.log('━'.repeat(60));
    console.log('\n✅ Data seeding completed!\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding data:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedFromDataFolder();
}

module.exports = { seedFromDataFolder };

