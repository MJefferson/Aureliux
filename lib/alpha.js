var Randomizer = require('./randomizer');
var util = require("util");
var events = require("events");

var Lens = function(){
	
	events.EventEmitter.call(this);
	this.aus = function(){
		this.response = {};
		generate();
		return this;
	}
	this.response = {};
	parens = this;
	function generate(){
		Randomizer.word({ type: "adj"}, function(rw){
			response = rw + " ";
			Randomizer.word({type: "noun"}, function(rw){
				response += rw;
				uid = Math.floor(Math.random()*50000);
				instance = {
					uid : uid,
					phrase : response 
				}
				parens.response = instance;
				parens.emit("fin");
			})
		});
	}
}

util.inherits(Lens, events.EventEmitter);
module.exports = Lens;

