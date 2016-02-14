var express = require('express');
var router = express.Router();
var jsonfile = require('jsonfile');
var sparkclient = require("../sparkclient");
jsonfile.spaces = 2;
var util = require('util');
var SparkPost = require('sparkpost');
var sparkClient = new SparkPost("a43e2c6f22be937608691a17fe79e686df3b477e");
//var sparkClient = new SparkPost("db5a9a60694fe517f5366deb44cf037c16823a47");

var Busboy = require('busboy');
var inspect = util.inspect;



router.post('/blastEmails', function(req, res) {
  var jsonData = req.body.jsonData;
  console.log(jsonData);
  console.log("Doing transmissions.send...");
  sparkClient.transmissions.send(JSON.parse(jsonData), function(err, resp) {
    if (err) {
      console.log(err);
      res.render("error");
    } else {
      console.log(resp.body);
      console.log("sendTransmission done");
      res.redirect("/dashboard");
    }
  });
});

router.post('/uploadCampaign', function(req, res) {
  console.log("uploading...");

    var busboy = new Busboy({ headers: req.headers });
    var allData = '';
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
      file.on('data', function(data) {
        console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
        allData += data;
      });
      file.on('end', function() {
        console.log('File [' + fieldname + '] Finished');
      });
    });
    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
      console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    });
    busboy.on('finish', function() {
      console.log('Done parsing form!');
      //res.writeHead(303, { Connection: 'close', Location: '/' });
      //res.end();
      
      var dataJson =  JSON.parse(allData); 
      console.log('allData', dataJson);
      console.log('Sending to verification');
      res.render('verifyCampaign', {allData: allData});
      // sparkClient.transmissions.send(dataJson, function(err, resp) {
      //   if (err) {
      //     console.log(err);
      //     res.json({err: err});
      //   } else {
      //     console.log(resp.body);
      //     console.log("sendTransmission done");
      //     res.json(resp.body);
      //   }
      // });
    });
    req.pipe(busboy);
  
});



router.get('/dashboard', function(req, res, next) {
  res.render('dashboard');
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/test', function(req, res, next) {
  sparkclient.sendTest();
  res.render('index');
});

// router.get('/verifyCampaign', function(req, res) {
//   res.render('verifyCampaign');
// });

router.get('/campaign', function(req, res) {
  res.render('campaign');
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




router.get('/api/sendTransmission', function(req, res) {

  console.log('sendTransmission...');


  var reqOpts = {
    transmissionBody: {
      options: {
        open_tracking: true,
        click_tracking: true,
        transactional: true
      },
      campaign_id: "christmas_campaign",
      substitution_data: {
        sender: "Big Store Team",
        user_type: "students"
      },
      recipients: [
        {
          address: {
            email: "sohamashodiya@gmail.com",
            name: "Soham"
          },
          substitution_data: {
            customer_type: "Platinum",
            place: "Bedrock"
          }
        },
        {
          address: {
            email: "kashodiya@gmail.com",
            name: "Kaushik"
          },
          substitution_data: {
            customer_type: "KKKPlatinum",
            place: "KKKBedrock"
          }
        }
      ],
      content: {
        from: {
          name: "Fred Flintstone",
          email: "kaushik@ashodiya.poojarosebeauty.com"
        },
        subject: "Big Christmas savings!",
        text: "Hi {{address.name}} \nSave big this Christmas in your area {{place}}! \nClick http://www.mysite.com and get huge discount\n Hurry, this offer is only to {{user_type}}\n {{sender}}",
        html: "<p>Hi {{address.name}} \nSave big this Christmas in your area {{place}}! \nClick http://www.mysite.com and get huge discount\n</p><p>Hurry, this offer is only to {{user_type}}\n</p><p>{{sender}}</p>"
      }
    }
  };
  
  sparkClient.transmissions.send(reqOpts, function(err, resp) {
    if (err) {
      console.log(err);
      res.json({err: err});
    } else {
      console.log(resp.body);
      console.log("sendTransmission done");
      res.json(resp.body);
    }
  });

});


router.get('/api/getAllTemplates', function(req, res) {

  console.log('getting templates');
  sparkClient.templates.all(function(err, data) {
    if (err) {
      console.log(err);
      res.json({err: err});
    } else {
      console.log(data.body);
      console.log('Congrats you can use our SDK!');
      res.json(data.body);
    }
  });

});


router.get('/api/getTemplate/:id', function(req, res) {

  console.log('getting template', req.params.id);
  
  var options = {
    id: req.params.id
  };
  
  sparkClient.templates.find(options, function(err, resp) {
    if (err) {
      console.log(err);
      res.json({err: err});
    } else {
      console.log(resp.body);
      console.log('Got template!');
      res.json(JSON.parse(resp.body));
    }
  });


});




router.get('/api/getTransmissions', function(req, res) {

  console.log('getting Transmissions');

  sparkClient.transmissions.all(function(err, resp) {
    if (err) {
      console.log(err);
      res.json({err: err});
    } else {
      console.log(resp.body);
      console.log('Congrats you can use our SDK!');
      res.json(resp.body);
    }
  });

});




router.get('/api/createTemplate', function(req, res) {

  console.log('creating template');
  var options = {
    template: {
      id: 'TEST_ID'
      , name: 'Test Template'
      , content: {
        from: 'test@test.com'
        , subject: 'Test email template!'
        , html: '<b>This is a test email template!</b>'
      }
    }
  };  
  sparkClient.templates.create(options, function(err, resp) {
    if (err) {
      console.log('error creating template', err);
      res.json({err: err});
    } else {
      console.log(resp.body);
      console.log('template created');
      res.json(resp.body);
    }
  });

});



module.exports = router;
