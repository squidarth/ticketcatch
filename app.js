
/**
 * Module dependencies.
 */


var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var childProcess = require('child_process');
var phantomjs = require("phantomjs");
var mongodb = require("mongodb").MongoClient;
var binPath = phantomjs.path;

var twilio = require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_ACCT_TOKEN);

var app = express();
var db;

console.log("express started");
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

mongodb.connect("mongodb://" + process.env.MONGO_USRNAME + ":" + process.env.MONGO_PASSWORD + "@ds039037.mongolab.com:39037/heroku_app23809192", function(err, database) {
  db =  database;
  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });
});

app.get('/', routes.index);

app.post("/registrations", function(req, resp) {
  var childArgs = [
    path.join(__dirname, "phantomjs-script.js"),
    req.body.license_plate,
    req.body.state
  ];
  var collection = db.collection("registrations");

  collection.insert({"license_plate" : req.body.license_plate, "phone_number" : req.body.phone_number}, function(err, docs) {
     resp.json({success: true});
  });
  childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
     data = JSON.parse(stdout);
     if (data["data"].length > 1 ) {
       for (var i = 0;i < data["data"].length - 1; i++) {
         var message = "You received a ticket on " + data["data"][i]["date"] + " for $" + data["data"][i]["amount"] +
                      ", go to https://paydirect.link2gov.com/NYCParking-Plate/ItemSearch to pay.";
         twilio.sendMessage({
           to: "+1" + req.body.phone_number,
           from: "+1415-599-2671",
           body: message
         });
       }
     }
  });
});

app.get('/users', user.list);



