
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

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/alpha', function(req, res){
	function countWords(type, callback){
		db.collection("words").count({type: type}, function(a, count){
			eval(type + "Count = count");
			if(callback){
				callback();
			}
		});
	}
	
	function removeUnderscore(word){
		return word.replace(/_/g, " ");
	}
	function setupServer(resp){
		function removeUnderscore(word){
			return word.replace(/_/g, " ");
		}
		function getRandomWord(type, callback){
			randomKey = eval("Math.floor(Math.random()*"+type+"Count)");
			db.collection("words").findOne({ type: type, num: randomKey }, function(err, res){
				randed = removeUnderscore(res.word);
				callback(randed);
			});
		}
		
		function respond(){
			consoleFeedback = "Request made. Random phrase is: ";
			
			getRandomWord("adj", function(rw){
				response = rw + " ";
				getRandomWord("noun", function(rw){
					response += rw;
					console.log(consoleFeedback + response.green);
					uid = Math.floor(Math.random()*50000);
					instance = {
						uid : uid,
						phrase : response 
					}
				  	db.collection("instances").insert(instance);
					resp.render('alpha', { title: 'Aureliux', phrase: response, inst: uid});
				});
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
	
	countWords("noun", function(){ countWords("adj", function(){ setupServer(res); })});
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
