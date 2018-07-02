'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var bodyParser = require('body-parser');
var cors = require('cors');

var myApp = require('./myApp.js');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connect(process.env.MONGO_URI, { useMongoClient: true });
app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.post('/api/shorturl/new', myApp.newUrl);

app.get("/api/shorturl/:shorturl", myApp.getShortUrl);


app.listen(port, function () {
  console.log('Node.js listening ...');
});