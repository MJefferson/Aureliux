var Randomizer = require('./randomizer');
var util = require("util");
var events = require("events");
var debug = require('debug')('aurel:alpha-lens')
// var colors = require('colors');
// var $ = require('jquery');

var Lens = function (res, options) {
  options = options || { format: "json" }

  this.aus = function () {
    generate();
  };

  function generate() {
    let adjective = Randomizer.word({type:'adj'});
    let noun = Randomizer.word({type: 'noun'});

    Promise.all([adjective, noun]).then( values => {
      let [ randomAdjective , randomNoun ] = values;
      let phrase = `${ randomAdjective } ${ randomNoun }`;
      let uid = Math.floor( Math.random() * 50000 );

      let instance = { phrase, uid };

      debug(`Request made. Random phrase ${ uid }: ${ instance.phrase }.`);

      if (options.format == "json") {
        res.json(instance, 200);
      } else {
        res.render('think', { title: 'Aureliux', phrase: instance.phrase, inst: instance.uid });
      }
    }, error => {
        res.render('error', error);
    });
  }
};

util.inherits(Lens, events.EventEmitter);
module.exports = Lens;

