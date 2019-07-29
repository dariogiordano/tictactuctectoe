const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");
const crypto = require('crypto');
const app = express();
// our localhost port
const port = process.env.PORT || 3000;
// our server instance
const server = http.createServer(app);
// This creates our socket using the instance of the server
const io = socketIO();
app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "build", "index.html"));
});
server.listen(port, () => console.log(`Listening on port ${port}`));
io.listen(server);
//////////////////////////////////////////////
const mountGrid = match => {
  let h = Math.min(match.player1.cohhorinates[1], match.player1.cohhorinates[1]);
  let w = Math.min(match.player2.cohhorinates[0], match.player2.cohhorinates[0]);
  //get number of cells
  w = Math.floor((w - 20) / 30);
  h = Math.floor((h - 60) / 30);
  //if with and height are even get the closest odd

  w = w % 2 ? w : w - 1;
  h = h % 2 ? h : h - 1;
  const centerVIndex = Math.floor(h / 2);
  const centerHIndex = Math.floor(w / 2);
  let grid = [];
  for (let i = 0; i < h; i++) grid.push(new Array(w).fill("empty"));
  let otherPlayer = actualPlayer === "O" ? "X" : "O";
  grid[centerVIndex].splice(centerHIndex, 1, otherPlayer);

  return grid;
};
var actualPlayer = "O";
var matches = [];

const registerPlayer = (cohordinates, roomName,symbol) => {
 if(!roomName)
 {
  
 
 }
};

io.on("connection", socket => {
  console.log("Users connected");
  socket.on("register player", (cohordinates, roomName=null,symbol) => {
   
   const newRoomName =roomName|| crypto.randomBytes(256).toString('hex');
   registerPlayer(cohordinates, newRoomName,symbol);
   socket.join(newRoomName)
    if(!roomName){
      let match={
        roomName:newRoomName,
        player1:{
          cohordinates,
          symbol
        }
      }
      matches.push(match);
        io.to(newRoomName).emit("set my player", newRoomName);
    }else{
     let match=matches.find(match=>match.roomName===roomName);
     match.player2={
      cohordinates,
      symbol
     }
      let state = {
        grid: mountGrid(match),
        matchStatus: "progress",
        actualPlayer,
        roomeName:newRoomName
      };
      io.to(newRoomName).emit("update", state);
    }
  });

  socket.on("moved", state => {
    actualPlayer = actualPlayer === "O" ? "X" : "O";
    state.actualPlayer = actualPlayer;

    io.to(state.roomName).emit("update", state);
  });
  socket.on("won", state => {
    state.matchStatus = "lost";
    state.grid = state.grid.map(row => {
      return row.map(cell => {
        return cell === "win" ? "lost" : cell;
      });
    });
    console.log(state.grid);
    io.to(state.roomName).emit("update", state);
  });

  socket.on("player will unregister", () => {
    socket.disconnect();
    players = [];
  });

  socket.on("disconnect", () => {
    players = [];
    console.log("Users disconnected");
    io.sockets.emit("left alone");
  });
});
