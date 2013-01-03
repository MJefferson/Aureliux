var Randomizer = require('./randomizer');
var util = require("util");
var events = require("events");
var colors = require('colors');
var $ = require('jquery');

var Lens = function(res, options){
	options = options || { format: "json"}
	
	this.aus = function(){
		generate();
	}

	function generate(){
          var consoleFeedback = "Request made. Random phrase is: ";
          
          var a = Randomizer.word({type:'adj'}), n = Randomizer.word({type: 'noun'});

          $.when(a, n).done(function(adjective, noun){
            var consoleFeedback = "Request made. Random phrase is: ";
            var phrase = adjective + " " + noun;
            var uid = Math.floor(Math.random()*50000);

            var instance = {
                uid: uid,
                phrase: phrase
            }

            console.log(consoleFeedback + instance.phrase.green);

            if(options.format == "json"){
              res.json(instance, 200);
            } else {
              res.render('think', { title: 'Aureliux', phrase: instance.phrase, inst: instance.uid});
            }

          });
	}
}

util.inherits(Lens, events.EventEmitter);
module.exports = Lens;

