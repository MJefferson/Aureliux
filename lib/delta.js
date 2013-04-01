var Randomizer = require('./randomizer');
var util = require("util");
var events = require("events");
var colors = require('colors');
var $ = require('jquery');

var Lens = function(res, options){
	var options = options || { format: "json"}
	
	this.aus = function(){
		generate();
	}

	function generate(){
          var consoleFeedback = "Request made. Random phrase is: ";
          
          var v = Randomizer.word({type:'verb'}), n = Randomizer.word({type: 'noun'}), n2 = Randomizer.word({type: 'noun'}), v2 = Randomizer.word({type: 'verb'}), adv = Randomizer.word({type: 'adv'});

          $.when(v, n, n2, v2, adv).done(function(verb, noun, noun2, verb2, adverb){
            var consoleFeedback = "Request made. Random phrase is: ";
            var phrase = "If you " + verb + " the " + noun + ", the " + noun2 + " will " + verb2 + " " + adverb;
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

