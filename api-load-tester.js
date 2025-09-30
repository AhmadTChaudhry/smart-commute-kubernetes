const http = require('http');

// --- CONFIGURATION ---
// Public Load Balancer DNS Name.
const TARGET_URL = 'http://a555ba35184224fae8c89e39fc56490c-1956333221.ap-southeast-2.elb.amazonaws.com/vehicles';

const CONCURRENT_REQUESTS = 100; // How many requests to send at once
const TEST_DURATION_MS = 120 * 1000; // Run the test for 2 minutes (120,000 ms)
// ---------------------

if (!TARGET_URL.includes('elb.amazonaws.com')) {
    console.error('\nERROR: Please update the TARGET_URL in the script with your Load Balancer DNS name.\n');
    process.exit(1);
}

let requestsSent = 0;
let requestsCompleted = 0;

console.log(`Starting load test against: ${TARGET_URL}`);
console.log(`Sending batches of ${CONCURRENT_REQUESTS} concurrent requests...`);

const agent = new http.Agent({ keepAlive: true, maxSockets: CONCURRENT_REQUESTS });

function makeRequest() {
    return new Promise((resolve, reject) => {
        const req = http.get(TARGET_URL, { agent }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                requestsCompleted++;
                resolve(res.statusCode);
            });
        });
        req.on('error', (e) => {
            requestsCompleted++;
            resolve(null); 
        });
    });
}

const testInterval = setInterval(() => {
    const promises = [];
    for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
        promises.push(makeRequest());
        requestsSent++;
    }
    Promise.all(promises); 
}, 100); 

setInterval(() => {
    console.log(`Requests - Sent: ${requestsSent}, Completed: ${requestsCompleted}`);
}, 5000);

setTimeout(() => {
    clearInterval(testInterval);
    console.log('\nLoad test finished.');
    console.log(`Total requests sent: ${requestsSent}`);
    process.exit(0);
}, TEST_DURATION_MS);