document.addEventListener('DOMContentLoaded',function() {
  var username;
  var message_div = document.getElementById("message");
  var login_div = document.getElementById("login");
  var waiting_div = document.getElementById("waiting");
  var grid_div = document.getElementById("grid");
  var flash_div = document.getElementById("flash");
  var userslist_div = document.getElementById("userslist");
  var socket = io.connect(url);
  var player;
  var cells = document.querySelectorAll(".cell");
  var wins = { me: 0, op: 0, draw: 0 };

  socket.on("identified", function(result) {
    if (result === username) {
      login_div.style.display = "none";
      waiting_div.style.display = "block";
    } else {
      username = "";
      flash_div.innerHTML = result.message;
    }
  });
  socket.on("users list", function (data) {
    userslist_div.children[1].innerHTML = "";
    for (i=0;i<data.length;i++) {
      li = document.createElement("li");
      li.id = data[i];
      if (data[i] === username) {
        li.className = "me";
      } else {
        li.className = "op";
        li.addEventListener("click",fight);
      }
      li.appendChild(document.createTextNode(data[i]));
      userslist_div.children[1].appendChild(li);
    }
  });

  Array.prototype.randomElement = function () {
      return this[Math.floor(Math.random() * this.length)]
  }
  var showmessage = function(text) {
    message_div.innerHTML = text;
    message_div.style.display = "block";
  }
  var fight = function(e) {
    op = e.target.id;
    socket.emit("challenge", op);
  }
  var play = function(el) {
    el.className = "cell " + player;
    for (i=0;i<cells.length;i++) {
      cells[i].removeEventListener("click",clicklistener);
    }
    socket.emit("play", { player: player, shot: el.id});
    player = (player === "x") ? "o" : "x";
  }
  socket.on("next",function(data) {
    if (data.result === "draw") {
      endgame();
      wins.draw++;
      document.getElementById("draw").innerHTML = wins.draw;
      showmessage("Draw ...");
    } else if (data.result === "win") {
      if (data.player === username) {
        endgame();
        wins.me++;
        document.getElementById("me").innerHTML = wins.me;
        showmessage("You win!");
      } else {
        endgame();
        wins.op++;
        document.getElementById("op").innerHTML = wins.op;
        showmessage(op+" wins :(");
      }
    } else if (data.player === username) {
      for (i=0;i<data.cells.length;i++) {
        document.getElementById(data.cells[i]).addEventListener("click",clicklistener);
      }
      showmessage("Your turn");
    } else {
      showmessage("Waiing for "+op+" move ...");
    }
  });
  var clicklistener = function(e) {
    play(e.target);
  }
  var endgame = function() {
    for (i=0;i<cells.length;i++) {
      cells[i].className += " done";
      cells[i].removeEventListener("click",clicklistener);
    }
    document.getElementById("again").style.display = "block";
  }
  var reset = function() {
    grid3 = [[false,false,false],[false,false,false],[false,false,false]];
    for (i=0;i<cells.length;i++) {
      cells[i].className = "cell active";
      cells[i].removeEventListener("click",clicklistener);
    }
    document.getElementById("again").style.display = "none";
  }
  socket.on("fight",function(data) {
    console.log(data);
    for (i=0;i<cells.length;i++) {
      cells[i].addEventListener("click",clicklistener);
    }
    grid_div.style.display = "block";
    waiting_div.style.display = "none";
    socket.send("start game");
  });


  document.getElementById("again").addEventListener("click", function(e) {
    reset();
  });
  document.getElementById("loginsubmit").addEventListener("click", function(e) {
    e.preventDefault();
    username = document.getElementById("username").value;
    socket.emit("identify", username);
  });

});