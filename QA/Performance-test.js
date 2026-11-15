import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. Test Configuration
export const options = {
  stages: [
    { duration: '10s', target: 20 }, // to 20 Virtual Users (VUs)
    { duration: '30s', target: 20 }, // Sustain 20 VUs for 30 seconds
    { duration: '10s', target: 0 },  // down to 0 VUs
  ],
  thresholds: {
    // We expect 95% of requests to complete in under 250ms
    http_req_duration: ['p(95)<250'], 
    // We expect the failure rate to be less than 1%
    http_req_failed: ['rate<0.01'],   
  },
};

// 2. Test Execution
export default function () {
  const url = 'http://localhost:4000/products';
  
  const res = http.get(url, {
    headers: { 'Accept': 'application/json' },
  });

  // 3. Validation
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has data array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.data);
      } catch (e) {
        return false;
      }
    },
  });

  sleep(1); 
}
