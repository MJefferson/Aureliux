var fs = require('fs');
var carrier = require('carrier');
var mongo = require('mongoskin'), db = mongo.db('localhost:27017/aurelius-test?auto_reconnect');

var types = ["adj", "adv", "noun", "verb"];
var typeCounter = 0;

function insertWordsByType(type){
	var i = 0;
	var inStream = fs.createReadStream('./dbsource/index.' + type, {flags:'r'});
	carrier.carry(inStream).on('line', function(line){
		i++;
		word = line.split(' ')[0];
		record = {
			num: i,
			word: word,
			type: type
		}
		
		db.collection("words").insert(record);

	}).on('end', function(){
		console.log("Inserted %d records of type %s", i, type);
		totalWords += i;
		typeCounter++;
		if(typeCounter === types.length){
			console.log("Aureliux database created.");
			process.exit();
		}
	});
}

console.log('Creating Aureliux database...');
types.forEach(function(val, j, arr){
		insertWordsByType(val);	
});





