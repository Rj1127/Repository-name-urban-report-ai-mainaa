import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
    const localUri = process.env.MONGODB_LOCAL_URI;
    const atlasUri = process.env.MONGODB_URI;

    if (atlasUri.includes('<db_password>')) {
        console.error('\n❌ ERROR: You must replace <db_password> in your backend/.env file with your actual database password first!\n');
        process.exit(1);
    }

    console.log('🔌 Connecting to local offline database...');
    const localDb = mongoose.createConnection(localUri);
    localDb.on('error', console.error.bind(console, 'Local connection error:'));
    await localDb.asPromise();

    console.log('☁️  Connecting to Cloud MongoDB Atlas...');
    const atlasDb = mongoose.createConnection(atlasUri);
    atlasDb.on('error', console.error.bind(console, 'Atlas connection error:'));
    await atlasDb.asPromise();

    const collections = ['users', 'issues'];

    for (const colName of collections) {
        console.log(`\n📦 Extracting '${colName}' dataset from local offline database...`);
        const docs = await localDb.collection(colName).find({}).toArray();
        if (docs.length > 0) {
            console.log(`🚀 Found ${docs.length} records! Transferring securely to Cloud Atlas...`);
            await atlasDb.collection(colName).insertMany(docs);
            console.log(`✅ Collection '${colName}' successfully migrated!`);
        } else {
            console.log(`ℹ️ Collection '${colName}' is empty locally, skipping.`);
        }
    }

    console.log('\n🎉 Database Migration successfully completed! Your data is now in the cloud!');
    await localDb.close();
    await atlasDb.close();
    process.exit(0);
}

migrate().catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
});
