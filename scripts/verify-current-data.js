require('dotenv').config();
const { MongoClient } = require('mongodb');

async function verifyData() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('YoutubeUrl');
    
    console.log('\n🔍 Looking for STUMFHU8PF92 documents...');
    
    const docs = await collection.find({ uniqueid: 'STUMFHU8PF92' }).sort({ createdAt: -1 }).toArray();
    
    console.log(`📊 Found ${docs.length} documents for STUMFHU8PF92`);
    
    docs.forEach((doc, index) => {
      console.log(`\n--- Document ${index + 1} ${index === 0 ? '(MOST RECENT - API USES THIS)' : ''} ---`);
      console.log('ID:', doc._id);
      console.log('Created:', doc.createdAt);
      console.log('Updated:', doc.updatedAt);
      console.log('Module count:', doc.Module?.length || 0);
      
      if (doc.Module && doc.Module.length > 0) {
        console.log('\nChapters:');
        doc.Module.forEach((module, i) => {
          const chapterKey = Object.keys(module)[0];
          const chapterData = module[chapterKey];
          console.log(`  ${i + 1}. ${chapterKey}: ${chapterData.videoTitle}`);
          console.log(`     URL: ${chapterData.videoUrl}`);
        });
      }
    });
    
    // Also check if there are any documents with different uniqueid formats
    console.log('\n🔍 Checking for similar uniqueids...');
    const allDocs = await collection.find({}).toArray();
    const uniqueIds = [...new Set(allDocs.map(doc => doc.uniqueid))];
    console.log('All uniqueids in collection:', uniqueIds);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

verifyData();
