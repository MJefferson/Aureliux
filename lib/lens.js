'use strict';

let Randomizer = require('./randomizer');
let debug = require('debug')('aurel:lens');

class CreativePatternLens {
  
  constructor (res, options = { format: 'json' }, pattern = "#adj #noun") {
    Object.assign(this, { pattern, options, res });
  }

  tokens() {
    return this.pattern.match(/#\w*/g).map(t => t.replace('#', ''));
  }

  aus() {
    return this.generate();
  }

  generate() {
    let randomWords = this.tokens().map(type => Randomizer.word({ type }));

    Promise.all(randomWords).then(selectedWords => {
      let phrase = this.pattern;
      let uid = Math.floor(Math.random() * 50000);

      this.tokens().forEach( (t, i) => phrase = phrase.replace(`#${t}`, selectedWords[i]));

      let instance = { phrase, uid };

      debug(`Request made. Random phrase ${ uid }: ${ instance.phrase }.`);

      if (this.options.format == "json") {
        this.res.json(instance, 200);
      } else {
        this.res.render('think', { title: 'Aureliux', phrase: instance.phrase, inst: instance.uid });
      }
    }, error => {
      this.res.render('error', error);
    });
  }
}
module.exports = CreativePatternLens;