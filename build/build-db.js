var fs = require('fs');
var carrier = require('carrier');
var mongo = require('mongodb').MongoClient;
var db;
var path = require('path');
var types = ["adj", "adv", "noun", "verb"];
var typeCounter = 0;
var totalWords = 0;
var records = [];

function createRecordsByType(type){
    var i = 0;
    var inStream = fs.createReadStream(path.join(__dirname + '/dbsource/index.' + type), {flags:'r'});
    carrier.carry(inStream).on('line', function(line){
        i++;
        var word = line.split(' ')[0];
        var record = {
            num: i,
            word: word,
            type: type
        };
        
        records.push(record);

    }).on('end', function(){
      totalWords += i;
      typeCounter++;
      
      if(typeCounter == types.length){
        insertRecords();
      }
    });
}

function insertRecords(){
  console.log("inserting records");
  db.collection('words').insertMany(records).then(result => {
    console.log(result.insertedCount);

    console.log("Aureliux database created.");
    db.close();
    process.exit();
  });
}

mongo.connect('mongodb://localhost/aurelius', (err, connection) => {
  if(err) throw err;
  
  db = connection;
  console.log("connected to mongodb database!")
  console.log('Creating Aureliux database...');
  types.forEach(function(val, j, arr){
    createRecordsByType(val);    
  });
  
});





