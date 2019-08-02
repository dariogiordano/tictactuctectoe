import React from "react";
import StyledCell from "./styled";
class Cell extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange() {
    if (this.props.usable && this.props.status === "empty")
      this.props.onCellClick(this.props.vIndex, this.props.hIndex);
  }
  render() {
    var className=`${this.props.highlight? "flash":""} ${this.props.status === "win"? "won":""} ${this.props.status === "lost"? "lost":""}`;
    return (
      <StyledCell
        filled={this.props.status !== "empty"}
        usable={this.props.usable}
        className={className}
        userSign={this.props.userSign}
        onClick={this.handleChange}
      >
        {this.props.status === "empty" ? " " : this.props.status}
      </StyledCell>
    );
  }
}
export default Cell;
