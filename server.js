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
app.use(express.static(path.join(__dirname, "prod/build")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "prod/build", "index.html"));
});
server.listen(port, () => console.log(`Listening on port ${port}`));
io.listen(server);
//////////////////////////////////////////////

var matches = [];

const mountGrid = match => {
  let h = Math.min(match.player1.cohordinates[1], match.player2.cohordinates[1]);
  let w = Math.min(match.player1.cohordinates[0], match.player2.cohordinates[0]);
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
  let otherPlayer = match.actualPlayer === "O" ? "X" : "O";
  grid[centerVIndex].splice(centerHIndex, 1, otherPlayer);
  return grid;
};
io.on("connection", socket => {
  console.log("User connected ");
  socket.on("register player", (cohordinates, roomName,symbol) => {
    const newRoomName =roomName || crypto.randomBytes(8).toString('hex');
    socket.roomName=newRoomName;
    socket.join(newRoomName)
    //se non viene passato un roomName vuol dire che e una nuova partita: in questo caso va registrato il player numero1
    if(!roomName){
      let match={
        actualPlayer:symbol,
        roomName:newRoomName,
        player1:{
          cohordinates,
          symbol,
          socket
        }
      }
      matches.push(match);
      console.log("Player 1 registered. New room Name: ", newRoomName );
      io.to(newRoomName).emit("set my player", newRoomName);
    }else{
      let match=matches.find(match=>match.roomName===roomName);
      if(match){
        match.player2={
          cohordinates,
          symbol,
          socket
        }
        let state = {
          grid: mountGrid(match),
          matchStatus: "progress",
          actualPlayer:match.actualPlayer,
          roomName:newRoomName
        };
        console.log("Player 2 registered. New room Name: ", newRoomName );
        io.to(newRoomName).emit("update", state);
      }
    }
  });

  socket.on("moved", state => {
    let match=matches.find(match=>match.roomName===state.roomName);
    match.actualPlayer = match.actualPlayer === "O" ? "X" : "O";
    state.actualPlayer = match.actualPlayer;
    console.log("UPDATE ROOM N°: ",state.roomName );
    io.to(state.roomName).emit("update", state);
  });

  socket.on("won", state => {
    state.matchStatus = "lost";
    state.grid = state.grid.map(row => {
      return row.map(cell => {
        return cell === "win" ? "lost" : cell;
      });
    });
    io.to(state.roomName).emit("update", state);
  });

  socket.on("player will unregister", state => {
    socket.disconnect();
  });
  socket.on("disconnect", () => {
    //rimuovo il match dalla lista dei match registrati
    matches= matches.filter(match=>match.roomName!==socket.roomName);
    io.to(socket.roomName).emit("left alone");
    console.log(`User from room n° ${socket.roomName} disconnected`);
  });
});