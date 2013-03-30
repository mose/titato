// to run tests:
// npm install jasmine-node -g
// jasmine-node spec/

var game = require("../lib/game");
var userlist = new game.Userlist();

describe('Userlist', function(){
  var userlist;

  beforeEach(function() {
    userlist = new game.Userlist();
  });

  it ("adds a user (addUser)", function(){
    user = userlist.addUser("alice",null);
    expect(user.constructor).toBe(game.User);
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