var express = require('express');
var router = express.Router();
var jsonfile = require('jsonfile');
var sparkclient = require("../sparkclient");
var redis = require('redis');
var client = redis.createClient(16022, 'pub-redis-16022.us-east-1-3.7.ec2.redislabs.com', {
  no_ready_check: true
});
jsonfile.spaces = 2;
var util = require('util');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/test', function(req, res, next) {
  sparkclient.sendTest();
  res.render('index');
});


/* This function returns timestamp of first message. 
 *  If the message is empty, it returns false
 */
function getTimestamp(msgList) {
  var eventTypes = ['relay_event', 'unsubscribe_event', 'gen_event', 'track_event', 'message_event'];
  for (var i = 0; i < eventTypes.length; i++) {
    if (msgList[0].msys[eventTypes[i]]) {
      return msgList[0].msys[eventTypes[i]].timestamp;
    }
  }
  return false;
}


router.post('/api/webhook', function(req, res) {
  //console.log("Object", JSON.stringify(req.body,null,2));

  var timestamp = getTimestamp(req.body);
  //console.log('timestamp', timestamp); 

  if (timestamp) {
    var file = process.env.ONTAP_FOLDER + "/" + timestamp + ".json";
    console.log("Saving file", file);
    jsonfile.writeFile(file, req.body, function(err) {
      if (err) {
        console.error('Error while saving file:', err);
      }
    });
  }
  else {
    console.log("Saving nothing");
  }

  res.sendStatus(200);
});

router.post('api/webhook-redis', function(req, res) {
  client.auth('radha111', function(err) {
    if (err) console.log("err");
  });

  client.on('connect', function() {
    console.log('Connected to Redis');
  });
});

module.exports = router;
