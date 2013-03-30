var Grid = function() {
  this.slots = [[false,false,false],[false,false,false],[false,false,false]];

  this.transpose = function() {
    self = this
    return Object.keys(this.slots[0]).map(function (c) { return self.slots.map(function (r) { return r[c]; }); });
  }
  this.diagonalize = function() {
    return [ [ this.slots[0][0], this.slots[1][1], this.slots[2][2] ], [ this.slots[0][2], this.slots[1][1], this.slots[2][0] ] ];
  }
  this.fullgrid = function() {
    return this.slots.concat(this.transpose()).concat(this.diagonalize());
  }
  this.add = function(player,position) {
    id = position.split("");
    if (this.slots[id[0]][id[1]] === false) {
      this.slots[id[0]][id[1]] = player;
      return true;
    } else {
      return false;
    }
  }
}

var Game = function(att,def) {
  this.attack = att;
  this.defend = def;
  this.grid = new Grid;
  this.checkmark = function(player) {
    return (player === this.attack) ? 'a' : 'd';
  }
  this.playedslots = function() {
    return this.grid.fullgrid().map(function(x){ return x.map(function(y){if(y!==false) return y; }).join("") });
  }
  this.play = function(player,position) {
    return this.grid.add(this.checkmark(player), position);
  }
  this.finished = function() {
    return (this.playedslots().join("").length === 24);
  }
  this.firstplayer = function() {
    return [ this.attack, this.defend ][Math.floor(Math.random()*2)];
  }
  this.nextplayer = function(player) {
    return (this.attack === player) ? this.defend : this.attack;
  }
  this.checkwinner = function() {
    if (this.playedslots().indexOf("aaa") !== -1) {
      return this.attack;
    } else if (this.playedslots().indexOf("ddd") !== -1) {
      return this.defend;
    } else {
      return false;
    }
  }
}

var User = function(name, socket) {
  this.name = name;
  this.socket = socket;
  this.playing = false;
}

var Userlist = function() {
  this.all = {};
  this.names = function() {
    return Object.keys(this.all);
  }
  this.length = function() {
    return Object.keys(this.all).length;
  }
  this.addUser = function(name,socket) {
    if (name in this.names()) {
      return false;
    } else {
      user = new User(name,socket);
      this.all[name] = user;
      return user;
    }
  }
  this.dropUser = function(name) {
    delete this.all[name];
    return true;
  }
  this.available = function() {
    av = [];
    for (u in this.all) {
      if (!this.all[u].playing) av.push(this.all[u].name);
    }
    return av;
  }
  this.getUser = function(name) {
    return this.all[name];
  }
  this.getSocket = function(name) {
    return this.all[name].socket;
  }
}

module.exports = exports;
exports.User = User;
exports.Grid = Grid;
exports.Game = Game;
exports.Userlist = Userlist;
