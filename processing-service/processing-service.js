const mqtt = require('mqtt');
const { MongoClient } = require('mongodb');

// --- CONFIGURATION ---
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://node-red:1883';
const MQTT_TOPIC = 'vehicles/+/data';
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

    mqttClient.on('message', async (topic, message) => {
        try {
            const vehicleData = JSON.parse(message.toString());
            const vehicleId = vehicleData.vehicleId;

            await collection.updateOne(
                { vehicleId: vehicleId }, 
                { $set: vehicleData },  
                { upsert: true }         
            );

        } catch (e) {
            console.error('Processing Service: Failed to process message:', e);
        }
    });
}

main().catch(console.error);