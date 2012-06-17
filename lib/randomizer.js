/**
 * Randomizer
 * author: M Jefferson
 */

mongo = require('mongoskin'),
    db = mongo.db('localhost:27017/aurelius?auto_reconnect')

module.exports = {
  word: function (options, callback) {
    options = options || { type: 'noun'}
    callback = callback || function(){}
    getRandomWord(options.type, callback);
  },
  counts: {},
  init: function(){
  	initCounts();
  }
};

// Private methods

var counts = {};

function initCounts(){
	types = ["noun", "adj", "verb", "adv"];
	for(key in types){
		type = types[key];
		countWords(type, function(){});
	}
}

function removeUnderscore(word){
	return word.replace(/_/g, " ");
}

function countWords(type, callback){
	db.collection("words").count({type: type}, function(a, count){
		counts[type] = count;
		if(callback){
			callback();
		}
	});
}

function getRandomWord(type, callback){
	randomKey = Math.floor(Math.random()*parseInt(counts[type]));
	db.collection("words").findOne({ type: type, num: randomKey }, function(err, result){
		if (err) throw err;
		randed = removeUnderscore(result.word);
		callback(randed);
	});
}
