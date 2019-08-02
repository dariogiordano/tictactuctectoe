import React from "react";
import StyledCopyToClipboard from "./styled";
class CopyToClipboard extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state={copied:false}
  }
  handleChange() {
    var copyText = document.getElementById("myCopyInput");

    /* Select the text field */
    copyText.select();
  
    /* Copy the text inside the text field */
    document.execCommand("copy");
  
    this.setState(state=>({
        copied:true
    }));
    copyText.focus();
    copyText.selectionEnd = copyText.selectionStart;
  }
  render() {
    return (
      <StyledCopyToClipboard onClick={this.handleChange} className="">
           <input type="text" id="myCopyInput" readOnly value={this.props.content} /><button>{this.state.copied?'copied':'click to copy'}</button>
      </StyledCopyToClipboard>
    );
  }
}
export default CopyToClipboard;
