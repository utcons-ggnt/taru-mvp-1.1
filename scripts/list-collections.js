const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taru2');
    console.log('✅ MongoDB connected:', conn.connection.host);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

async function listCollections() {
  try {
    await connectDB();
    
    console.log('\n🔍 Listing all collections in the database...\n');
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log(`📊 Total collections found: ${collections.length}`);
    
    if (collections.length === 0) {
      console.log('❌ No collections found in database');
      return;
    }
    
    console.log('\n📋 Collection names:');
    collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name} (type: ${collection.type || 'collection'})`);
    });
    
    // Look for YouTube-related collections
    const youtubeCollections = collections.filter(col => 
      col.name.toLowerCase().includes('youtube') || 
      col.name.toLowerCase().includes('url')
    );
    
    if (youtubeCollections.length > 0) {
      console.log('\n🎥 YouTube-related collections:');
      youtubeCollections.forEach(col => {
        console.log(`  - ${col.name}`);
      });
      
      // Check document count in each YouTube collection
      for (const col of youtubeCollections) {
        try {
          const count = await mongoose.connection.db.collection(col.name).countDocuments();
          console.log(`    └─ ${col.name}: ${count} documents`);
          
          if (count > 0) {
            // Get sample document structure
            const sample = await mongoose.connection.db.collection(col.name).findOne();
            console.log(`    └─ Sample document keys:`, Object.keys(sample || {}));
            if (sample && sample.uniqueid) {
              console.log(`    └─ Sample uniqueid:`, sample.uniqueid);
            }
          }
        } catch (error) {
          console.log(`    └─ Error checking ${col.name}:`, error.message);
        }
      }
    } else {
      console.log('\n❌ No YouTube-related collections found');
    }
    
    // Also check all collections for documents with uniqueid field
    console.log('\n🔍 Checking all collections for uniqueid field...');
    for (const col of collections) {
      try {
        const sampleWithUniqueId = await mongoose.connection.db.collection(col.name).findOne({ uniqueid: { $exists: true } });
        if (sampleWithUniqueId) {
          const count = await mongoose.connection.db.collection(col.name).countDocuments({ uniqueid: { $exists: true } });
          console.log(`  ✅ ${col.name}: ${count} documents with uniqueid field`);
          console.log(`     Sample uniqueid: ${sampleWithUniqueId.uniqueid}`);
        }
      } catch (error) {
        // Ignore errors for system collections
      }
    }
    
  } catch (error) {
    console.error('❌ Error listing collections:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n👋 MongoDB connection closed');
  }
}

// Run the inspection
listCollections();
