
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

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/alpha', function(req, res){

	function setupServer(resp){
		function respond(){
			consoleFeedback = "Request made. Random phrase is: ";
			
			Randomizer.word({ type: "adj"}, function(rw){
				response = rw + " ";
				Randomizer.word({type: "noun"}, function(rw){
					response += rw;
					console.log(consoleFeedback + response.green);
					uid = Math.floor(Math.random()*50000);
					instance = {
						uid : uid,
						phrase : response 
					}
				  	//db.collection("instances").insert(instance);
					resp.render('alpha', { title: 'Aureliux', phrase: response, inst: uid});	
				})
			});
		}
		
		if (req.url === '/favicon.ico') {
			res.writeHead(200, {'Content-Type': 'image/x-icon'} );
		    res.end();
		    return;
		} else {
			respond();
		}
	}
	
	setupServer(res);
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
