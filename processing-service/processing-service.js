const mqtt = require('mqtt');
const { MongoClient } = require('mongodb');

// --- CONFIGURATION ---
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://node-red:1883';
const MQTT_TOPIC = 'vehicles/+/data';

// Private IP of SmartCommute-DB-Server instance.
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo-db:27017';
const DB_NAME = 'smartcommute';
const COLLECTION_NAME = 'vehicle_state';
// ---------------------

async function main() {
    console.log('Processing Service: Connecting to MongoDB...');
    const mongoClient = new MongoClient(MONGO_URL);
    await mongoClient.connect();
    console.log('Processing Service: Connected to MongoDB.');
    const db = mongoClient.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log(`Processing Service: Connecting to MQTT Broker at ${MQTT_BROKER_URL}`);
    const mqttClient = mqtt.connect(MQTT_BROKER_URL);

    mqttClient.on('connect', () => {
        console.log('Processing Service: Connected to MQTT Broker.');
        mqttClient.subscribe(MQTT_TOPIC, (err) => {
            if (!err) {
                console.log(`Processing Service: Subscribed to topic: ${MQTT_TOPIC}`);
            }
        });
    });

    // This function is triggered every time a message is received
    mqttClient.on('message', async (topic, message) => {
        try {
            const vehicleData = JSON.parse(message.toString());
            const vehicleId = vehicleData.vehicleId;

            // Use 'updateOne' with 'upsert' to efficiently insert or update the vehicle's state
            await collection.updateOne(
                { vehicleId: vehicleId }, // The document to find
                { $set: vehicleData },   // The new data
                { upsert: true }         // If it doesn't exist, create it
            );
            // console.log(`Processed update for ${vehicleId}`); // Uncomment for verbose logging

        } catch (e) {
            console.error('Processing Service: Failed to process message:', e);
        }
    });
}

main().catch(console.error);