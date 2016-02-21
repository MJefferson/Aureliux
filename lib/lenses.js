var CreativeFragmentLens = require('./lens');

class Αlpha extends CreativeFragmentLens {
  constructor(res, options={format: 'json'}) {
    super(res, options, '#verb the #noun')
  }
};

class βeta extends CreativeFragmentLens {
  constructor(res, options={format: 'json'}) {
    super(res, options, '#verb the #noun')
  }
};

class Γamma extends CreativeFragmentLens {
  constructor(res, options={format: 'json'}) {
    super(res, options, '#verb #adv')
  }
}

class Δelta extends CreativeFragmentLens {
  constructor(res, options={format: 'json'}) {
    super(res, options, '#verb spectacularly into the #noun')
  }
}

module.exports = { Α: Αlpha, β: βeta, Γ: Γamma, Δ: Δelta };