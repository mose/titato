var game = require("../lib/game");
var userlist = new game.Userlist();

describe('Userlist', function(){
  var userlist;

  beforeEach(function() {
    userlist = new game.Userlist();
  });

  it ("adds a user (addUser)", function(){
    userlist.addUser("alice",null);
    expect(userlist.all.length).toBe(1);
  });
  it ("has the name in list (names)", function(){
    userlist.addUser("alice",null);
    expect(userlist.all[0].name).toBe("alice");
  });
  it ("has only the list of non-playing users (available)", function(){
    alice = userlist.addUser("alice",null);
    bob = userlist.addUser("bob",null);
    alice.playing = true;
    expect(userlist.all[0]).toBe(alice);
    expect(userlist.all.length).toBe(2);
    expect(userlist.available.length).toBe(1);
  });


});