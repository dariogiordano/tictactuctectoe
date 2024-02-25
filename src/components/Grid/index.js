import React from "react";
import socketIOClient from "socket.io-client";
import Cell from "../../components/Cell";
import CopyToClipboard from "../../components/CopyToClipboard";
import Row from "../../components/Row";
import StyledGrid from "./styled";

class Grid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      myPlayer: null,
      actualPlayer: null,
      grid: [],
      matchStatus: null,
      roomName:this.props.roomName,
      standby:false
    };

    this.onUnload = this.onUnload.bind(this);
    this.togglePlayer = this.togglePlayer.bind(this);
    this.newGame = this.newGame.bind(this);
    this.socket = socketIOClient("/");
    this.highlightCohordinates=[];
    this.socket.on("set my player", newRoomName => {
      console.log(newRoomName);
      if(newRoomName)
      this.setState(state => ({
        roomName: newRoomName
      }));
    });

    this.socket.on("left alone", () => {
      this.props.history.push(`/quitted/`);
    });

    this.socket.on("connection lost", () => {
      this.setState(state => ({
        standby: true
      })); 
    });

    this.socket.on("connection recovered", () => {
      this.setState(state => ({
        standby: false
      }));
    });

    this.socket.on('reconnect', (attemptNumber) => {
      this.socket.emit("user reconnected", this.state.roomName,this.state.myPlayer);
    });

    /*
    "Update" si verifica ogni volta che uno dei due giocatori effettua una mossa,
    subito dopo la mia mossa anche io ricevo l'update
    */
    this.socket.on("update", (newState, vIndex, hIndex) => {
      //se il mio status è in WON vuol dire che ho vinsto en on accetto più cambiamenti, almento che
      //il nuovo stato in arrivo non sia "New game", il che vuol dire che il mio avversario ha chiesto un'altra partita
      if (this.state.matchStatus !== "won" || newState.matchStatus==="new game") {
        //vIndex, hIndex e la posizione della casella riempita dall'avversario la mossa precedente.
        if(vIndex && hIndex) this.highlightCohordinates=[vIndex,hIndex];
        else this.highlightCohordinates=[];
        this.setState(state => ({
          grid: newState.grid,
          actualPlayer: newState.actualPlayer,
          matchStatus: newState.matchStatus
        }));
      }
    });
  }

  getNewItemIndexes(vIndex, hIndex, direction) {
    switch (direction) {
      case "NW": vIndex--; hIndex--; break;
      case "N": vIndex--; break;
      case "NE": vIndex--; hIndex++; break;
      case "E": hIndex++; break;
      case "SE": vIndex++; hIndex++; break;
      case "S": vIndex++; break;
      case "SW": vIndex++; hIndex--; break;
      case "W": hIndex--; break;
    }
    return { vIndex, hIndex };
  }

  recursiveRowSearch(vIndex, hIndex, direction, results) {
    let newElement = this.getSiblings(vIndex, hIndex).find(
      el => el.direction === direction
    );
    if (newElement && newElement.value === this.state.myPlayer) {
      vIndex = this.getNewItemIndexes(vIndex, hIndex, direction).vIndex;
      hIndex = this.getNewItemIndexes(vIndex, hIndex, direction).hIndex;
      results.push([vIndex, hIndex]);
      return this.recursiveRowSearch(vIndex, hIndex, direction, results);
    } else return results;
  }

  getItemsInARow(vIndex, hIndex) {
    let E_W = [
      ...this.recursiveRowSearch(vIndex, hIndex, "E", [[vIndex, hIndex]]),
      ...this.recursiveRowSearch(vIndex, hIndex, "W", [])
    ];
    let N_S = [
      ...this.recursiveRowSearch(vIndex, hIndex, "N", [[vIndex, hIndex]]),
      ...this.recursiveRowSearch(vIndex, hIndex, "S", [])
    ];
    let NE_SW = [
      ...this.recursiveRowSearch(vIndex, hIndex, "NE", [[vIndex, hIndex]]),
      ...this.recursiveRowSearch(vIndex, hIndex, "SW", [])
    ];
    let NW_SE = [
      ...this.recursiveRowSearch(vIndex, hIndex, "NW", [[vIndex, hIndex]]),
      ...this.recursiveRowSearch(vIndex, hIndex, "SE", [])
    ];
    if (E_W.length === 5) {
      return E_W;
    } else if (N_S.length === 5) {
      return N_S;
    } else if (NE_SW.length === 5) {
      return NE_SW;
    } else if (NW_SE.length === 5) {
      return NW_SE;
    } else return [];
  }

  onUnload(){
    this.socket.emit("player will unregister");
  }

  newGame(){
    let newState = { ...this.state };
    this.socket.emit("new game", newState);
  }

  togglePlayer(vIndex, hIndex) {
    let grid = this.state.grid;
    this.highlightCohordinates=[];
    grid[vIndex][hIndex] = this.state.myPlayer;
    let itemsInARow = this.getItemsInARow(vIndex, hIndex);
    if (itemsInARow.length === 5) {
      itemsInARow.forEach(el => {
        grid[el[0]][el[1]] = "win";
      });
      this.setState(state => ({
        grid: grid,
        matchStatus: "won"
      }));
      this.socket.emit("won", this.state);
    } else {

      let newState = { ...this.state };
      newState.grid = grid;
      newState.matchStatus="progress";
      this.socket.emit("moved", newState,vIndex, hIndex);
    }
  }

  getSiblings(vIndex, hIndex) {
    let grid = this.state.grid;
    let lowerSiblings = [];
    if (vIndex < grid.length - 1) {
      grid[vIndex + 1].forEach((cell, index) => {
        if (index === hIndex - 1)
          lowerSiblings.push({ value: cell, direction: "SW" });
        else if (index === hIndex)
          lowerSiblings.push({ value: cell, direction: "S" });
        else if (index === hIndex + 1)
          lowerSiblings.push({ value: cell, direction: "SE" });
      });
    }
    let sideSiblings = [];
    grid[vIndex].forEach((cell, index) => {
      if (index === hIndex - 1)
        sideSiblings.push({ value: cell, direction: "W" });
      else if (index === hIndex + 1)
        sideSiblings.push({ value: cell, direction: "E" });
    });
    let upperSiblings = [];
    if (vIndex > 0) {
      grid[vIndex - 1].forEach((cell, index) => {
        if (index === hIndex - 1)
          upperSiblings.push({ value: cell, direction: "NW" });
        else if (index === hIndex)
          upperSiblings.push({ value: cell, direction: "N" });
        else if (index === hIndex + 1)
          upperSiblings.push({ value: cell, direction: "NE" });
      });
    }
    return [...lowerSiblings, ...sideSiblings, ...upperSiblings];
  }

  getIsUsable(vIndex, hIndex) {
    if (
      this.state.matchStatus === "won" ||
      this.state.matchStatus === "lost" ||
      this.state.myPlayer !== this.state.actualPlayer
    )
      return false;
    let siblings = this.getSiblings(vIndex, hIndex);
    return (
      siblings.some(el => {
        return el.value === "◯" || el.value === "╳";
      }) 
    );
  }

  getIsHighlight(vIndex, hIndex){
    if(this.highlightCohordinates.length>1
      && this.highlightCohordinates[0]===vIndex
      && this.highlightCohordinates[1]===hIndex
      && this.state.myPlayer===this.state.actualPlayer) return true;
    else return false;
  }

  componentDidMount() {
    window.addEventListener("beforeunload", this.onUnload)
    if(this.props.roomName){
      this.socket.emit("register player", [
        window.innerWidth,
        window.innerHeight
      ],this.props.roomName,"◯");

      this.setState(state => ({
        myPlayer:"◯"
      }));
    }else{
      this.socket.emit("register player", [
        window.innerWidth,
        window.innerHeight
      ],null,"╳");
      this.setState(state => ({
        myPlayer:"╳"
      }));
    }
  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.onUnload)
    this.socket.emit("player will unregister");
  }

  render() {
    if (this.state.standby === true)
    return <div> Waiting to reconnect with your opponent... </div>
    if (this.state.matchStatus === null){
      var content=`${window.location.href}/${this.state.roomName}`;
      return <div>
        Send this link to the person you want to play with:<br /><br />
        <CopyToClipboard content={content} />
      </div>;
    }
    let message = "Wait for your opponent's move...";
    if (this.state.matchStatus === "won") message = "You WON!";
    else if (this.state.matchStatus === "lost") message = "You LOST!";
    else if (this.state.myPlayer === this.state.actualPlayer) message = "Make your move!";
    if (this.state.matchStatus === "new game") message = "NEW GAME! "+ message;
 
    return (
      <div>
        <p>{message} {(this.state.matchStatus === "won" || this.state.matchStatus === "lost") && (<button onClick={this.newGame}>click to start a new game</button>)}</p>
        <StyledGrid>
          <div>
          {this.state.grid.map((row, vIndex) => (
            <Row key={vIndex} rowHeight={this.state.grid.length}>
              {this.state.grid[vIndex].map((item, hIndex) => (
                <Cell
                  cellHeight={this.state.grid.length}
                  rowwidth={this.state.grid[vIndex].length}
                  vIndex={vIndex}
                  hIndex={hIndex}
                  key={hIndex}
                  status={this.state.grid[vIndex][hIndex]}
                  usable={this.getIsUsable(vIndex, hIndex)}
                  highlight={this.getIsHighlight(vIndex, hIndex)}
                  userSign={this.state.myPlayer}
                  onCellClick={this.togglePlayer}
                />
              ))}
            </Row>
          ))}
          </div>
        </StyledGrid>
      </div>
    );
  }
}
export default Grid;
