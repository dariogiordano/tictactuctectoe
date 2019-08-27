import styled from "styled-components";

const styledCopyToClipboard = styled.div`
display:flex;
input{
  margin: 0 0 10px 0;
  outline: 0;
  vertical-align: middle;
  background: none;
  border: 0;
  cursor: pointer;
  font-size:16px;
  width:320px;
  padding: 0;
  font-weight:bold
}
button{
    cursor:pointer;
}
  &.flash {
   
    animation: flash 1s ease-out;
    animation-iteration-count: 1;
  }

  
  @keyframes flash {
    0% { 
      background-color: #ffffff; 
    }
    10% { 
      background-color: #00ff00; 
    }        
    100% {
      background-color: #ffffff;
    }
  }

  
  
`;

export default styledCopyToClipboard;
