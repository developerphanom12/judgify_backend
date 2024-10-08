const http = require('k6/http');
const { check, sleep } = require('k6');

module.exports.options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '30s', target: 100},
  ],
  // Configure JSON output
  ext: {
    loadimpact: {
      distribution: {
        'myscenario': { loadZone: 'amazon:us:ashburn', percent: 100 },
      },
    },
  },
  // Output format
  summaryTrendStats: ['avg', 'p(95)', 'max', 'med'],
  // Configure thresholds
  thresholds: {
    'http_req_failed': ['rate<0.1'], 
    'http_req_duration': ['p(95)<500'],
  },
};

module.exports.default = function () {
  const res = http.get('http://localhost:4000/api/seller/subcategoryData/5');

  check(res, {
    'status is 201': (r) => r.status === 201,
  });

  sleep(1);
};
