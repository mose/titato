// to run tests:
// npm install jasmine-node -g
// jasmine-node spec/

var g = require("../lib/game");

describe('Userlist', function(){
  var userlist;

  beforeEach(function() {
    userlist = new g.Userlist();
  });

  it ("adds a user (addUser)", function(){
    user = userlist.addUser("alice",null);
    expect(user).toEqual(jasmine.any(g.User));
  });

  it ("drops a user (addUser)", function(){
    userlist.addUser("alice",null);
    userlist.addUser("bob",null);
    userlist.addUser("charlie",null);
    expect(userlist.length()).toBe(3);
    userlist.dropUser("bob");
    expect(userlist.length()).toBe(2);
  });

  it ("knows its length (length)", function(){
    user = userlist.addUser("alice",null);
    expect(userlist.length()).toBe(1);
  });

  it ("has the user in list (names)", function(){
    user = userlist.addUser("alice",null);
    expect(userlist.all['alice']).toBe(user);
  });
  
  it ("has only the list of non-playing users (available)", function(){
    alice = userlist.addUser("alice",null);
    bob = userlist.addUser("bob",null);
    alice.playing = true;
    expect(userlist.available().length).toBe(1);
  });
  
  it ("retrives the user object from his name (getUser)", function(){
    alice = userlist.addUser("alice",null);
    expect(userlist.getUser('alice')).toBe(alice);
  });
  
  it ("stores the socket for each user (getSocket)", function(){
    socket = new Object;
    alice = userlist.addUser("alice",socket);
    expect(userlist.getSocket('alice')).toBe(socket);
  });

});

describe('Grid', function(){

  beforeEach(function() {
    grid = new g.Grid();
  });

  it ("knows how to transpose (transpose)", function(){
    grid.slots[1][0] = "x";
    grid.slots[1][2] = "y";
    tslots = grid.transpose();
    expect(tslots[0][1]).toBe("x");
    expect(tslots[2][1]).toBe("y");
  });

  it ("knows how to extract diagonals (diagonalize)", function(){
    grid.slots[0][0] = "x";
    grid.slots[0][2] = "y";
    diag = grid.diagonalize();
    expect(diag[0][0]).toBe("x");
    expect(diag[1][0]).toBe("y");
  });

  it ("knows how to build a fullgrid (fullgrid)", function(){
    full = grid.fullgrid();
    expect(full.length).toBe(8);
  });

});

describe('Game', function(){

  beforeEach(function() {
    game = new g.Game('x','o');
  });

  it ("begins with an empty grid", function(){
    expect(game.grid).toEqual(jasmine.any(g.Grid));
  });

  it ("keeps track of the played slots as a single dimension array (playedslots)", function(){
    game.grid.slots[0][0] = "x";
    expect(game.playedslots()).toEqual([ 'x', '', '', 'x', '', '', 'x', '' ]);
  });

  it ("makes it possible to play a slot (play)", function(){
    expect(game.play("x","21")).toBeTruthy();
    expect(game.playedslots()).toEqual([ '', '', 'a', '', 'a', '', '', '' ]);
  });

  it ("makes it impossible to play a slot that was already played (play)", function(){
    game.play("x","21")
    game.play("o","11")
    expect(game.play("x","21")).toBeFalsy();
    expect(game.playedslots()).toEqual([ '', 'd', 'a', '', 'da', '', 'd', 'd' ]);
  });

  it ("knows when the game is unfinished (finished)", function(){
    game.grid.slots = [['x','x','x'],['x',false,'x'],['x','x','x']];
    expect(game.finished()).toBeFalsy();
  });

  it ("knows when the game is finished (finished)", function(){
    game.grid.slots = [['x','x','x'],['x','x','x'],['x','x','x']];
    expect(game.finished()).toBeTruthy();
  });

  it ("selects fairly a random first player (firstplayer)", function(){
    num = { "x": 0, "o": 0 };
    for (i=0;i<100;i++) {
      num[game.firstplayer()]++;
    }
    diff = Math.abs(num["x"] - num["o"]);
    expect(diff).toBeLessThan(25);
  });

  it ("knows who plays next (nextplayer)", function(){
    expect(game.nextplayer("x")).toEqual("o");
  });

  it ("knows if nobody won yet (checkwinner)", function(){
    game.play("x","01");
    game.play("x","11");
    expect(game.checkwinner()).toBeFalsy();
  });

  it ("knows if 'x' won (checkwinner)", function(){
    game.play("x","01");
    game.play("x","11");
    game.play("x","21");
    expect(game.checkwinner()).toEqual("x");
  });

  it ("knows if 'x' won (checkwinner)", function(){
    game.play("o","00");
    game.play("o","11");
    game.play("o","22");
    expect(game.checkwinner()).toEqual("o");
  });

});
