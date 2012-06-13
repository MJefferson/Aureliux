
/**
 * Module dependencies.
 */

var express = require('express'), routes = require('./routes'), mongo = require('mongoskin'),
    db = mongo.db('localhost:27017/aurelius?auto_reconnect'), colors = require('colors');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

var Randomizer = require('./lib/randomizer');
Randomizer.init();
var Alpha = require('./lib/alpha');

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

app.get('/alpha.json', function(req, res){
	consoleFeedback = "Request made. Random phrase is: ";
	
	var lens = new Alpha();
  	lens.on("fin", function(){
  		response = lens.response;
  		console.log(consoleFeedback + response.phrase.green);
  		res.json(response);
  	}).aus();
});

app.get('/alpha', function(req, res){
	consoleFeedback = "Request made. Random phrase is: ";
	
	var lens = new Alpha();
  	lens.on("fin", function(){
  		response = lens.response;
  		console.log(consoleFeedback + response.phrase.green);
  		res.render('alpha', { title: 'Aureliux', phrase: response.phrase, inst: uid});
  	});
  	lens.aus();
});

app.post('/save', function(req, res){
	console.log(req.body);
	resp = req.body;
	db.collection("instances").insert({ uid: parseInt(resp.uid), phrase: resp.phrase});
	res.json({status: 200}, 200);
});

app.get('/instance/:id', function(req,res){
	db.collection("instances").findOne({ uid: parseInt(req.params.id) }, function(err, result){
		//console.log(err);
		res.render('alpha', { title: 'Aureliux', phrase: result.phrase, inst: req.params.id });
	});
});

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
