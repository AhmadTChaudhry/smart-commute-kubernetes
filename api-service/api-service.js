const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

// --- CONFIGURATION ---
const PORT = 3000; 
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo-db:27017';
const DB_NAME = 'smartcommute';
const COLLECTION_NAME = 'vehicle_state';
// ---------------------

const app = express();

async function main() {
    console.log('API Service: Connecting to MongoDB...');
    const mongoClient = new MongoClient(MONGO_URL);
    await mongoClient.connect();
    console.log('API Service: Connected to MongoDB.');
    const db = mongoClient.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    app.get('/vehicles', async (req, res) => {
        try {
            const vehicles = await collection.find({}).toArray();
            res.json(vehicles);
        } catch (e) {
            console.error('API Service: Error fetching data from database:', e);
            res.status(500).send({ error: 'Failed to fetch vehicle data' });
        }
    });

    const staticFilesPath = path.join(__dirname, 'public');
    app.use(express.static(staticFilesPath));

    app.listen(PORT, () => {
        console.log(`API and Dashboard Service listening on http://localhost:${PORT}`);
    });
}

main().catch(console.error);
