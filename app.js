
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
  app.use(express.favicon(__dirname + '/public/favicon.ico', { maxAge: 2592000000 }));
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

app.post('/instances', function(req, res){
	console.log(req.body);
	resp = req.body;
	db.collection("instances").insert({ uid: parseInt(resp.uid), phrase: resp.phrase, lens: resp.lens});
	res.json({status: 200}, 200);
});

io.sockets.on('connection', function (socket) {
  socket.on('save', function(event){
  	socket.broadcast.emit('newsave');
  });
});

app.get('/instances.json', function(req, res){
	var page = req.query.page || 0;
	var size = 20;
	db.collection("instances").find({},{limit: size, skip: page*size, sort: [["_id", 'desc']]}).toArray(function(err, result) {
	    res.json({Results: result});
	});
});

app.get('/instances/:tags', function(req, res){
	
	var tags = req.params.tags.split(',');
	db.collection("instances").find({tags: {$in: tags}}).toArray(function(err, result){
		res.json({ tags: tags, instances: result});
	});
});

app.get('/instance/:id.json', function(req,res){
	db.collection("instances").findOne({ uid: parseInt(req.params.id) }, function(err, result){
		//console.log(err);
		res.json(result, 200);
	});
});

app.get('/instance/:id', function(req,res){
	db.collection("instances").findOne({ uid: parseInt(req.params.id) }, function(err, result){
		//console.log(err);
		res.render('alpha', { title: 'Aureliux', phrase: result.phrase, inst: req.params.id });
	});
});

app.put('/instance/:id', function(req,res){
	var uid = req.params.id || null;
	var tags = req.body.tags || null;
	// add flag to signal whether tag is being added or removed; defaults to add
	var remove = req.body.remove || false;
	
	if(uid !== null && tags !== null && !remove){
		console.log("adding tags: %s", tags);
		var tagArray = tags.split(',');
		db.collection("instances").update({uid: parseInt(uid)}, {'$addToSet': {tags: { '$each': tagArray}}}, function(error, result){
			if (error) throw error;
			res.json({Result: result}, 200);
		});
	} else if (uid !== null && tags !== null && remove) {
		console.log("removing tag: %s", tags);
		db.collection("instances").update({uid: parseInt(uid)}, {'$pullAll': {tags: [tags]}}, function(error, result){
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
