const mqtt = require('mqtt');

// --- CONFIGURATION ---
const NUM_BUSES = 500; 
const PUBLISH_INTERVAL = 1000; 
const brokerUrl = 'mqtt://localhost:1883'; 
// ---------------------

if (brokerUrl.includes('YOUR_APP_SERVER_PUBLIC_IP')) {
    console.error("\nERROR: Please update the 'brokerUrl' in the script with your EC2 instance's public IP address.\n");
    process.exit(1);
}

const client = mqtt.connect(brokerUrl);

client.on('connect', () => {
    console.log(`Successfully connected to MQTT broker at ${brokerUrl}`);
    console.log(`Starting load test with ${NUM_BUSES} vehicles, publishing every ${PUBLISH_INTERVAL}ms.`);

    setInterval(() => {
        console.log(`Publishing batch of ${NUM_BUSES} messages...`);
        for (let i = 1; i <= NUM_BUSES; i++) {
            const vehicleId = `bus-${i.toString().padStart(4, '0')}`;
            const topic = `vehicles/${vehicleId}/data`;

            const payload = {
                vehicleId: vehicleId,
                timestamp: new Date().toISOString(),
                gps: {
                    lat: -37.8136 + (Math.random() - 0.5) * 0.1,
                    lng: 144.9631 + (Math.random() - 0.5) * 0.1
                },
                passengerCount: Math.floor(Math.random() * 60)
            };
            client.publish(topic, JSON.stringify(payload));
        }
    }, PUBLISH_INTERVAL);
});

client.on('error', (err) => {
    console.error('MQTT Connection Error:', err);
});