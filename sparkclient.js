var SparkPost = require('sparkpost');

//console.log("SPARKPOST_API_KEY", process.env);

var client = new SparkPost("db5a9a60694fe517f5366deb44cf037c16823a47");

module.exports.sendTest = function() {
    

    var reqObj = {
      transmissionBody: {
        campaignId: 'first-mailing',
        content: {
          from: 'kaushik@ashodiya.poojarosebeauty.com',
          subject: 'First SDK Mailing',
          html: '<html><body><h1>Congratulations, {{name}}!</h1><p>You just sent your very first mailing!</p></body></html>',
          text: 'Congratulations, {{name}}!! You just sent your very first mailing!'
        },
        substitutionData: {name: 'KAUSHIK'},
        recipients: [{ address: { name: 'Kaushik Ashodiya', email: 'kaushik@ashodiya.poojarosebeauty.com' } }]
      }
    };
    
    client.transmissions.send(reqObj, function(err, res) {
      if (err) {
        console.log('Whoops! Something went wrong');
        console.log(err);
      } else {
        console.log('Woohoo! You just sent your first mailing!');
      }
    });
    
}