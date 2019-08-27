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
    var isiOSDevice = navigator.userAgent.match(/ipad|iphone/i);

	if (isiOSDevice) {
	  
		var editable = copyText.contentEditable;
		var readOnly = copyText.readOnly;

		copyText.contentEditable = true;
		copyText.readOnly = false;

		var range = document.createRange();
		range.selectNodeContents(copyText);

		var selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);

		copyText.setSelectionRange(0, 999999);
		copyText.contentEditable = editable;
		copyText.readOnly = readOnly;

	} else {
    copyText.select();
	}

    
  
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
      <StyledCopyToClipboard>
           <input type="text" id="myCopyInput" readOnly value={this.props.content} /> <button onClick={this.handleChange}>{this.state.copied?'copied':'click to copy'}</button>
      </StyledCopyToClipboard>
    );
  }
}
export default CopyToClipboard;
