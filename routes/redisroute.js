var express = require('express');
var router = express.Router();
var redis = require('redis');
var client = redis.createClient(16022, 'pub-redis-16022.us-east-1-3.7.ec2.redislabs.com', {
  no_ready_check: true
});

router.get('/test', function(req, res) {
  console.log("Connecting the redis server");
  
  client.auth('radha111', function(err) {
    if (err) console.log("err");
  });

  client.on('connect', function() {
    console.log('Connected to Redis');
    res.sendStatus(200);
  });
  
  client.on("error", function (err) {
    console.log("Error " + err);
    res.sendStatus(200);
  });
  
});

module.exports = router;
