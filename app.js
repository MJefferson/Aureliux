
/**
 * Module dependencies.
 */

var express = require('express'), routes = require('./routes'), mongo = require('mongoskin'),
    db = mongo.db('localhost:27017/aurelius?auto_reconnect'), colors = require('colors'), expose = require('express-expose');

var app = module.exports = express.createServer();
io = require('socket.io').listen(app);
// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

io.configure('production', function(){
  io.enable('browser client minification'); 
  io.enable('browser client etag');         
  io.enable('browser client gzip');  
  io.set('log level', 1);

  io.set('transports', [
    'websocket'
  , 'flashsocket'
  , 'htmlfile'
  , 'xhr-polling'
  , 'jsonp-polling'
  ]);
});

var Randomizer = require('./lib/randomizer');
Randomizer.init();
var Alpha = require('./lib/alpha');
var Beta = require('./lib/beta');
var Gamma = require('./lib/gamma');

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.expose('var socketaddr = "http://localhost";');
});

app.configure('production', function(){
  app.use(express.errorHandler());
  app.expose('var socketaddr = "http://184.72.234.5";');
});

// Routes

app.get('/', routes.index);

app.get('/think', function(req, res){
	var lens = new Alpha(res, {format: "html"});
	lens.aus();
});

app.get('/alpha.json', function(req, res){
	var lens = new Alpha(res, {format: "json"});
	lens.aus();
});

app.get('/beta.json', function(req, res){
	var lens = new Beta(res, {format: "json"});
	lens.aus();
});

app.get('/gamma.json', function(req, res){
	var lens = new Gamma(res, {format: "json"});
	lens.aus();
});

app.get('/renoun.json', function(req, res){
	Randomizer.rebuild("noun");
	res.json({status: 200}, 200);
});

app.get('/reverb.json', function(req, res){
	Randomizer.rebuild("verb");
	res.json({status: 200}, 200);
});

app.get('/readj.json', function(req, res){
	Randomizer.rebuild("adj");
	res.json({status: 200}, 200);
});

app.get('/readv.json', function(req, res){
	Randomizer.rebuild("adv");
	res.json({status: 200}, 200);
});

app.post('/save', function(req, res){
	console.log(req.body);
	resp = req.body;
	db.collection("instances").insert({ uid: parseInt(resp.uid), phrase: resp.phrase});
	res.json({status: 200}, 200);
});

io.sockets.on('connection', function (socket) {
  socket.on('save', function(event){
  	socket.broadcast.emit('newsave');
  });
});

app.get('/instances.json', function(req, res){
	var page = req.query.page || 0;
	console.log("page is: " + page);
	db.collection("instances").find({},{limit: 20, skip: page*20, sort: [["_id", 'desc']]}).toArray(function(err, result) {
	    res.json({Results: result});
	});
});

app.get('/instance/:id', function(req,res){
	db.collection("instances").findOne({ uid: parseInt(req.params.id) }, function(err, result){
		//console.log(err);
		res.render('alpha', { title: 'Aureliux', phrase: result.phrase, inst: req.params.id });
	});
});

app.put('/instance/:id', function(req,res){
	uid = req.params.id || null;
	tags = req.body.tags || null;
	
	if(uid !== null && tags !== null){
		tagArray = tags.split(',');
		db.collection("instances").update({uid: parseInt(uid)}, {'$addToSet': {tags: { '$each': tagArray}}}, function(error, result){
			if (error) throw error;
			res.json({Result: result}, 200);
		});
	} else {
		res.json({Error: "No instance specified or no new tags given."}, 404);
	}
});

app.listen(3005, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
