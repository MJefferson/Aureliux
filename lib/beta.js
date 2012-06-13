var Randomizer = require('./randomizer');
var util = require("util");
var events = require("events");
var colors = require('colors');

var Lens = function(res, options){
	options = options || { format: "json"}
	
	events.EventEmitter.call(this);
	this.aus = function(){
		generate();
	}
	function generate(){
		var consoleFeedback = "Request made. Random phrase is: ";
		
		Randomizer.word({ type: "verb"}, function(rew){
			var response = rew + " the ";
			Randomizer.word({type: "noun"}, function(rw){
				response += rw;
				uid = Math.floor(Math.random()*50000);
				instance = {
					uid : uid,
					phrase : response 
				}
				console.log(consoleFeedback + instance.phrase.green);
				if(options.format == "json"){
					res.json(instance, 200);
				} else {
					res.render('beta', { title: 'Aureliux', phrase: instance.phrase, inst: instance.uid});
				}
				//parens.emit("fin");
			})
		});
	}
}

util.inherits(Lens, events.EventEmitter);
module.exports = Lens;

