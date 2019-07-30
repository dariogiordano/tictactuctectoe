import React from "react";
import socketIOClient from "socket.io-client";
import Cell from "../../components/Cell";
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
      roomName:this.props.roomName
    };
    this.togglePlayer = this.togglePlayer.bind(this);
   // this.socket = socketIOClient("http://localhost:3000");
     this.socket = socketIOClient("https://forza5.herokuapp.com/");

    this.socket.on("set my player", newRoomName => {
      console.log(newRoomName);
      if(newRoomName)
      this.setState(state => ({
        roomName: newRoomName
      }));
    });
    this.socket.on("left alone", () => {
      //alert("Your opponent quitted!");
      this.props.history.push(`/quitted/`);
    });
    this.socket.on("update", newState => {
      if (this.state.matchStatus !== "won") {
        this.setState(() => ({
          grid: newState.grid,
          actualPlayer: newState.actualPlayer,
          matchStatus: newState.matchStatus
        }));
      }
    });
  }

  getNewItemIndexes(vIndex, hIndex, direction) {
    switch (direction) {
      case "NW":
        vIndex--;
        hIndex--;
        break;
      case "N":
        vIndex--;
        break;
      case "NE":
        vIndex--;
        hIndex++;
        break;
      case "E":
        hIndex++;
        break;
      case "SE":
        vIndex++;
        hIndex++;
        break;
      case "S":
        vIndex++;
        break;
      case "SW":
        vIndex++;
        hIndex--;
        break;
      case "W":
        hIndex--;
        break;
      default:
        break;
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

  togglePlayer(vIndex, hIndex) {
    let grid = this.state.grid;
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
      
      this.socket.emit("moved", newState);
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
        return el.value === "O";
      }) ||
      siblings.some(el => {
        return el.value === "X";
      })
    );
  }

  componentDidMount() {
    if(this.props.roomName){
console.log(this.props.roomName);
    
    this.socket.emit("register player", [
      window.innerWidth,
      window.innerHeight
    ],this.props.roomName,"O");

    this.setState(state => ({
     
      myPlayer:"O"
    }));
    }else{
      this.socket.emit("register player", [
        window.innerWidth,
        window.innerHeight
      ],null,"X");
      this.setState(state => ({
     
        myPlayer:"X"
      }));
    }
  }
  componentWillUnmount() {
    this.socket.emit("player will unregister",this.state);
  }

  render() {
    if (this.state.matchStatus === null)
      return <div>wait for the other player to join you roomName:{this.state.roomName}</div>;
    let message = "Wait for your opponent's move...";
    if (this.state.matchStatus === "won") message = "You WON!";
    else if (this.state.matchStatus === "lost") message = "You LOST!";
    else if (this.state.myPlayer === this.state.actualPlayer)
      message = "Make your move!";

    return (
      <div>
        <p>{message}</p>
        <StyledGrid>
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
                  onCellClick={this.togglePlayer}
                />
              ))}
            </Row>
          ))}
        </StyledGrid>
      </div>
    );
  }
}
export default Grid;
