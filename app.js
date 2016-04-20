var express = require('express'),
    routes = require('./routes'),
    colors = require('colors'),
    compression = require('compression'),
    // expose = require('express-expose'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    logger = require('morgan');
var path = require('path');
var mongoose = require('mongoose');
var db = mongoose.connection;
mongoose.connect('mongodb://localhost/aurelius');
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connected to mongodb database!");
});

var app = express();

// Configuration
app.use(compression());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('jsonp callback', true);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(stylus.middleware({
//     src: path.join(__dirname, "app"),
//     compile: (str, path) => stylus(str).set('filename', path).set('compress', true).use(nib())
// }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '365 days' }));

/*
io.configure('production', function(){
  io.enable('browser client minification');
  io.enable('browser client etag');
  io.set('log level', 1);

  io.set('transports', [
    'websocket'
  , 'flashsocket'
  , 'htmlfile'
  , 'xhr-polling'
  , 'jsonp-polling'
  ]);
});*/

var Randomizer = require('./lib/randomizer');
Randomizer.init();
var { Α, β, Γ, Δ } = require('./lib/lenses.js');

/*if (app.get('env') === 'production') {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
//   app.expose('var socketaddr = "http://184.72.234.5";');
} else {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
//   app.expose('var socketaddr = "http://localhost";');
}*/

app.get('/',  function(req, res){
    var lens = new Α(res, {format: "html"});
    lens.aus();
});

app.get('/think', function(req, res){
    var lens = new Α(res, {format: "html"});
    lens.aus();
});

app.get('/generate', function(req, res){
    var lens = new Δ(res, {format: "html"});
    lens.aus();
});

app.get('/alpha.json', function(req, res){
    var lens = new Α(res, {format: "json"});
    lens.aus();
});


app.get('/beta.json', function(req, res){
    var lens = new β(res, {format: "json"});
    lens.aus();
});

app.get('/gamma.json', function(req, res){
    var lens = new Γ(res, {format: "json"});
    lens.aus();
});

app.get('/delta.json', function(req, res){
    var lens = new Δ(res, {format: "json"});
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
    var resp = req.body;
    db.collection("instances").insert({ uid: parseInt(resp.uid), phrase: resp.phrase, lens: resp.lens}, {}, function(err){
        console.log(err);
    });
    res.json({status: 200}, 200);
});

//mobile clients have to save via a JSONP GET request
app.get('/instances.jsonp', function(req, res){
    var resp = req.query;
    db.collection("instances").insert({ uid: parseInt(resp.uid), phrase: resp.phrase, lens: resp.lens});
    res.json({status: 200}, 200);
});

/*require('socket.io').on('connection', function (socket) {
  socket.on('save', function(event){
      socket.broadcast.emit('newsave');
  });
});*/

app.get('/instances.json', function(req, res){
    var page = req.query.page || 1;
    var filter = (req.query.tags && req.query.tags.length > 0) ? {tags: {$in: req.query.tags.split(',')}} : {};
    var size = 10;

    db.collection("instances").find(filter,{limit: size, skip: (page-1)*size, sort: [["_id", 'desc']]}).toArray(function(err, result) {
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
        res.render('think', { title: 'Aureliux', phrase: result.phrase, inst: req.params.id, lens: result.lens, layout: "instance_layout"});
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

module.exports = app;