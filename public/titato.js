document.addEventListener('DOMContentLoaded',function() {
  var username;
  var opponent;
  var message_div = document.getElementById("message");
  var login_div = document.getElementById("login");
  var waiting_div = document.getElementById("waiting");
  var grid_div = document.getElementById("grid");
  var score_div = document.getElementById("score");
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
        if (username) {
          li.addEventListener("click",fight);
        }
      }
      li.appendChild(document.createTextNode(data[i]));
      userslist_div.children[1].appendChild(li);
    }
  });

  socket.on("message", function (data) {
    showmessage(data);
  });
  
  socket.on("fight",function(data) {
    opponent = data.op;
    grid_div.style.display = "block";
    waiting_div.style.display = "none";
    score_div.style.display = "block";
    document.getElementById("l_me").innerHTML = username;
    document.getElementById("l_op").innerHTML = opponent;
    for (i=0;i<cells.length;i++) {
      cells[i].className = "cell active";
    }
    document.getElementById("again").style.display = "none";
    if (data.first) {
      for (i=0;i<cells.length;i++) {
        cells[i].addEventListener("click",clicklistener);
      }
      showmessage("Challenging "+opponent+"<br />You play first.");
      player = "x";
    } else {
      showmessage("Challenging "+opponent+"<br />"+opponent+" play first.<br />Waiting ...");
      player = "o";
    }
  });

  socket.on("next",function(data) {
    if (data.position) {
      document.getElementById(data.position).className = "cell x";
    }
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
        showmessage(data.player+" wins :(");
      }
    } else if (data.player === username) {
      for (i=0;i<cells.length;i++) {
        if (cells[i].className == "cell active") {
          cells[i].addEventListener("click",clicklistener);
        }
      }
      if (Robot) {
        console.log(Robot.play(data.position));
      }
      showmessage("Your turn");
    } else {
      showmessage("Waiting for "+data.player+" move ...");
    }
  });

  socket.on("disco",function(data) {
    endgame();
    document.getElementById("again").style.display = "none";
    showmessage("ohh, seems that "+data.player+" disconnected. Game aborted ...");
  });

  var showmessage = function(text) {
    message_div.innerHTML = text;
    message_div.style.display = "block";
  }

  var fight = function(e) {
    opponent = e.target.id;
    socket.emit("challenge", opponent);
  }

  var play = function(el) {
    el.className = "cell o";
    for (i=0;i<cells.length;i++) {
      cells[i].removeEventListener("click",clicklistener);
    }
    socket.emit("play", { shot: el.id});
    player = "x";
  }

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
    socket.emit("challenge", opponent);
  }

  document.getElementById("again").addEventListener("click", function(e) {
    reset();
  });

  document.getElementById("loginsubmit").addEventListener("click", function(e) {
    e.preventDefault();
    username = document.getElementById("username").value;
    socket.emit("identify", username);
  });

  document.getElementById("save").addEventListener("click", function(e) {
    e.preventDefault();
    code = document.getElementById("robotscript").value;
    scripttag = document.getElementById("userscript");
    scripttag.innerHTML = code;
  });
  document.getElementById("expand").addEventListener("click", function(e) {
    e.preventDefault();
    div = document.getElementById("robotpanel")
    if (div.className === "wide") {
      div.className = "";
      this.innerHTML = "&lt;&lt; Expand";
    } else {
      div.className = "wide";
      this.innerHTML = "&gt;&gt; Collapse";
    }
  });

});