var Grid = function() {
  this.slots = [[false,false,false],[false,false,false],[false,false,false]];

  this.transpose = function() {
    return Object.keys(this.slots[0]).map(function (c) { return this.slots.map(function (r) { return r[c]; }); });
  }
  this.diagonalize = function(a) {
    return [ [ this.slots[0][0], this.slots[1][1], this.slots[2][2] ], [ this.slots[0][2], this.slots[1][1], this.slots[2][0] ] ];
  }
  this.fullgrid = function() {
    return this.slots.concat(this.slots.transpose).concat(diagonalize(this.slots));
  }
  this.add = function(position) {

  }
}

var Game = function(att,def) {
  this.attack = att;
  this.defend = def;
  this.grid = new Grid;

  this.playedslots = function() {
    return this.grid.map(function(x){ return x.map(function(y){if(y!==false) return y; }).join("") });
  }
  this.play = function(position) {
    this.grid.add(position);
  }
  this.finished = function() {
    return (this.playedslots().join("").length === 24);
  }
  this.firstplayer = function() {
    return [ this.attack, this.defend ][Math.floor(Math.random()*2)];
  }
}

module.exports = exports;
exports.Game = Game;