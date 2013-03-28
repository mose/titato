document.addEventListener('DOMContentLoaded',function() {
  var username;
  var stage = 0;
  var message_div = document.getElementById("message");
  var login_div = document.getElementById("login");
  var waiting_div = document.getElementById("waiting");
  var flash_div = document.getElementById("flash");
  var userslist_div = document.getElementById("userslist");
  var init_div = document.getElementById("init");
  var socket = io.connect(url);

  socket.on('connect', function () {
    socket.send("hello");
  });
  socket.on("new player", function (data) {
    var i = 0;
    it = document.getElementById(data);
    var loop = setInterval(function() {
      if (i < 100) {
        i = i + 5;
        it.style.opacity = i;
      } else {
        clearInterval(loop);
      }
    },200);
  });
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
      }
      li.appendChild(document.createTextNode(data[i]));
      userslist_div.children[1].appendChild(li);
    }
  });

  Array.prototype.randomElement = function () {
      return this[Math.floor(Math.random() * this.length)]
  }
  var getByClass = function(className, parent) {
    parent || (parent = document);
    var descendants = parent.getElementsByTagName("*"), i=-1, e, result=[];
    while (e = descendants[++i]) {
      ((' '+(e['class'] || e.className)+' ').indexOf(' '+className+' ') > -1) && result.push(e);
    }
    return result;
  }
  var triggerEvent = function(el, type) {
    if ((el[type] || false) && typeof el[type] == 'function') {
      el[type](el);
    }
  }
  var transpose = function(a) {
    return Object.keys(a[0]).map(function (c) { return a.map(function (r) { return r[c]; }); });
  }
  var diagonalize = function(a) {
    return [ [ grid3[0][0], grid3[1][1], grid3[2][2] ], [ grid3[0][2], grid3[1][1], grid3[2][0] ] ];
  }
  var fullgrid = function() {
    return grid3.concat(transpose(grid3)).concat(diagonalize(grid3));
  }
  var playedslots = function() {
    return fullgrid().map(function(x){ return x.map(function(y){if(y!==false) return y; }).join("") });
  }
  var playmove = function(i,x) {
    g = Math.floor(i/3);
    if (g === 0) {
      c = "" + i + x;
    } else if (g === 1) {
      c = "" + x + (i-3);
    } else {
      diag = [ ["00", "11", "22"], ["02", "11", "20"] ];
      d = i - 6;
      c = diag[d][x];
    }
    play(document.getElementById(c));
  }
  var showmessage = function(text) {
    message_div.innerHTML = text;
    message_div.style.display = "block";
  }
  var aiplay = function() {
    grid = fullgrid();
    if (playedslots().indexOf("xxx") !== -1) {
      endgame();
      wins.human++;
      showmessage("Human wins !");
      return;
    }
    winrow = playedslots().indexOf("oo");
    if (winrow !== -1) {
      wincell = grid[winrow].indexOf(false);
      playmove(winrow,wincell);
      endgame();
      wins.robot++;
      showmessage("Robot wins !");
      return;
    }
    defendrow = playedslots().indexOf("xx");
    if (defendrow !== -1) {
      defendcell = grid[defendrow].indexOf(false);
      playmove(defendrow,defendcell);
      return;
    }
    nextrow = playedslots().indexOf("o");
    if (nextrow !== -1) {
      nextcell = grid[nextrow].indexOf(false);
      playmove(nextrow,nextcell);
      return;
    }
    diags = ["00","02","11","20","22"];
    id = diags.randomElement();
    i = id.split("");
    if (grid[id[0]][id[1]] !== false) {
      diags.splice(diags.indexOf(id),1);
      i = diags.randomElement().split("");
    }
    playmove(i[0],i[1]);
  }
  var play = function(el) {
    id = el.id.split("");
    if (grid3[id[0]][id[1]] === false) {
      el.className = "cell " + player;
      grid3[id[0]][id[1]] = player;
      if (playedslots().join("").length === 24) {
        endgame();
        wins.draw++;
        showmessage("Draw ...");
      } else {
        player = (player === "x") ? "o" : "x";
        if (player === "o") {
          aiplay();
        }
      }
    }
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
    grid3 = [[false,false,false],[false,false,false],[false,false,false]];
    for (i=0;i<cells.length;i++) {
      cells[i].className = "cell active";
      cells[i].removeEventListener("click",clicklistener);
    }
    init_div.style.display = "block";
    document.getElementById("grid").style.display = "none";
    document.getElementById("again").style.display = "none";
    message_div.style.display = "none";
    document.getElementById("human").innerHTML = wins.human;
    document.getElementById("robot").innerHTML = wins.robot;
    document.getElementById("draw").innerHTML = wins.draw;
  }
  var init = function() {
    for (i=0;i<cells.length;i++) {
      cells[i].addEventListener("click",clicklistener);
    }
    init_div.style.display = "none";
    document.getElementById("grid").style.display = "block";
    if (player === "o") {
      aiplay();
    }
  }

  var player;
  var grid3 = [[false,false,false],[false,false,false],[false,false,false]];
  var cells = getByClass("cell");
  var start = getByClass("bl");
  var wins = { human: 0, robot: 0, draw: 0 };

  for (i=0;i<start.length;i++) {
    start[i].addEventListener("click",function(e) {
      player = e.target.getAttribute("data-player");
      init();
    });
  }
  document.getElementById("again").addEventListener("click", function(e) {
    reset();
  });
  document.getElementById("loginsubmit").addEventListener("click", function(e) {
    e.preventDefault();
    stage++;
    username = document.getElementById("username").value;
    socket.emit("identify", username);
  });

});