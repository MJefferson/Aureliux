/**
 * Randomizer
 * author: M Jefferson
 */

var mongo = require('mongoskin'),
    db = mongo.db('localhost:27017/aurelius?auto_reconnect');

module.exports = {
  word: function (options = { type: 'noun'}, callback = n => {}) {
    return getRandomWord(options.type, callback);
  },
  counts: {},
  init: initCounts,
  rebuild: rebuildIndex
};

// Private methods
var counts = {};
var types = ["noun", "adj", "verb", "adv"];

function initCounts(){
    for(var key in types){
        let type = types[key];
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
  return new Promise( (resolve, reject) => {
    var randomKey = Math.floor(Math.random()*parseInt(counts[type]));
    db.collection("words").findOne({ type: type, num: randomKey }, function(err, result){
      if (err){
        reject(err);
        throw err;
      } else {
        let randed = removeUnderscore(result.word);
        resolve(randed);
      }
    });
  }, err => {
    throw err;
  });
}

function rebuildIndex(type){
    var i = -1;
    
    db.collection("words").findEach({type: type}, function(err, result){
        if(result !== null){
            i++;
            db.collection("words").update({_id: result._id}, { '$set':{num: i} }, function(err){
                if (err) throw err;
                console.log('Updated num ' + i);
            });
        }
    });
}
