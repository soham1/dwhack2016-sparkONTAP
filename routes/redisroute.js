var express = require('express');
var router = express.Router();
var redis = require('redis');
var client = redis.createClient(16022, 'pub-redis-16022.us-east-1-3.7.ec2.redislabs.com', {
  no_ready_check: true
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
