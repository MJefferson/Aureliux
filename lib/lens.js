'use strict';

let Randomizer = require('./randomizer');
let debug = require('debug')('aurel:lens');

class SyntagmaticChain {

  constructor (res, options = { format: 'json' }, pattern = "#adj #noun") {
    Object.assign(this, { pattern, options, res });
  }

  tokens() {
    return this.pattern.match(/#\w*/g).map(t => t.replace('#', ''));
  }

  aus() {
    // var fragmentPromise = this.phrase().next();
    // global.c = fragmentPromise;
    return this.generate();
  }

  generate(limit=false) {
    let protoFragment = this.phrase(limit).next().value;
    
    Promise.resolve(protoFragment).then(fragment => {
      debug(`Request made. Random phrase ${ fragment.uid }: ${ fragment.phrase }.`);

      if (this.options.format == "json") {
        this.res.json(fragment, 200);
      } else {
        this.res.render('think', { title: 'Aureliux', phrase: fragment.phrase, inst: fragment.uid });
      }
    }, error => {
      this.res.render('error', {error});
    });
  }

  * phrase(limit=-1){
      var i = -1;
      var randomWords = w => this.tokens().map(type => Randomizer.word({ type }));
      
      if(!limit || i < limit){
        yield Promise.all(randomWords()).then(selectedWords => {
          let phrase = this.pattern;
          let uid = Math.floor(Math.random() * 50000);

          this.tokens().forEach( (t, i) => phrase = phrase.replace(`#${t}`, selectedWords[i]));

          return { phrase, uid };
          i++;
        }, rejectFragment => {rejectFragment(err);});
      }
  }
}
module.exports = SyntagmaticChain;