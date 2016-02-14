var express = require('express');
var dotenv = require('dotenv').config({path: '.env'});
var router = express.Router();
var jsonfile = require('jsonfile');
jsonfile.spaces = 2;
var util = require('util');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/api/webhook', function(req, res) {
  console.log("Object", JSON.stringify(req.body,null,2));
  if(req.body[0].msys.message_event){
    var file = process.env.ONTAP_FOLDER + "/message_event_" + req.body[0].msys.message_event.timestamp;
    console.log("File", file);
    var obj = req.body;
    jsonfile.writeFile(file, obj, function (err) {
      console.error(err)
    });
  }else{
    var file = process.env.ONTAP_FOLDER + "/track_event_" + req.body[0].msys.track_event.timestamp;
    console.log("File", file);
    var obj = req.body;
    jsonfile.writeFile(file, obj, function (err) {
      console.error(err)
    });
  }
  res.sendStatus(200);
});

module.exports = router;
