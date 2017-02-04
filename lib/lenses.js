let SyntagmaticChain = require('./lens');

class Αlpha extends SyntagmaticChain {
  constructor(res, options={format: 'json'}) {
    super(res, options, '#adj #noun')
  }
}

class βeta extends SyntagmaticChain {
  constructor(res, options={format: 'json'}) {
    super(res, options, '#verb the #noun')
  }
}

class Γamma extends SyntagmaticChain {
  constructor(res, options={format: 'json'}) {
    super(res, options, '#verb #adv')
  }
}

class Δelta extends SyntagmaticChain {
  constructor(res, options={format: 'json'}) {
    super(res, options, '#verb spectacularly into the #noun')
  }
}

module.exports = { Α: Αlpha, β: βeta, Γ: Γamma, Δ: Δelta };