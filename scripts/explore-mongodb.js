const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function exploreDatabase() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📊 Available Collections:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });

    // Explore each collection
    for (const collection of collections) {
      console.log(`\n🔍 Exploring collection: ${collection.name}`);
      
      const count = await db.collection(collection.name).countDocuments();
      console.log(`  📈 Document count: ${count}`);
      
      if (count > 0) {
        // Get a sample document
        const sampleDoc = await db.collection(collection.name).findOne();
        console.log(`  📄 Sample document structure:`);
        console.log(JSON.stringify(sampleDoc, null, 2));
        
        // Get field names
        const fieldNames = Object.keys(sampleDoc || {});
        console.log(`  🏷️  Field names: ${fieldNames.join(', ')}`);
      }
    }

    // Check for specific collections we're interested in
    const targetCollections = ['students', 'assessments', 'modules', 'studentprogress', 'users'];
    
    console.log('\n🎯 Checking target collections:');
    for (const collectionName of targetCollections) {
      const exists = collections.some(col => col.name === collectionName);
      const count = exists ? await db.collection(collectionName).countDocuments() : 0;
      console.log(`  ${exists ? '✅' : '❌'} ${collectionName}: ${count} documents`);
    }

  } catch (error) {
    console.error('❌ Error exploring database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

exploreDatabase();
