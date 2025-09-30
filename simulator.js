const mqtt = require('mqtt');

// --- CONFIGURATION ---
const NUM_BUSES = 20; // How many buses to simulate
const PUBLISH_INTERVAL = 5000; // Publish every 5 seconds
const brokerUrl = 'mqtt://13.211.219.43:30883';

// Melbourne CBD Coordinates
const MELB_LAT = -37.8136;
const MELB_LNG = 144.9631;
// ---------------------

function createBus(busNumber) {
    const client = mqtt.connect(brokerUrl);
    const vehicleId = `bus-${busNumber.toString().padStart(3, '0')}`;
    const topic = `vehicles/${vehicleId}/data`;

    client.on('connect', () => {
        setInterval(() => {
            const payload = {
                vehicleId: vehicleId,
                timestamp: new Date().toISOString(),
                gps: {
                    lat: MELB_LAT + (Math.random() - 0.5) * 0.05,
                    lng: MELB_LNG + (Math.random() - 0.5) * 0.05
                },
                passengerCount: Math.floor(Math.random() * 60)
            };
            client.publish(topic, JSON.stringify(payload));
        }, PUBLISH_INTERVAL);
    });

    client.on('error', (err) => { /* Suppress errors in simulation */ });
}

console.log(`Starting SmartCommute simulation for ${NUM_BUSES} vehicles...`);
for (let i = 1; i <= NUM_BUSES; i++) {
    createBus(i);
}