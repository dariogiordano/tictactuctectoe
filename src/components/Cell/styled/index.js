import styled from "styled-components";

const styledCell = styled.div`
  display: inline-block;
  width: 28px;
  height: 28px;
  text-align: center;
  line-height: 30px;
  border: 1px solid #ddd;
  ${props =>
    props.usable &&
    `
   background: rgba(0,0,0,0.05); 
   `};
  ${props =>
    props.filled &&
    `
   background: transparent; 
   `};
  &:hover {
    ${props =>
      props.usable &&
      `cursor: pointer;
     background: rgba(0,240,0,0.5); 
     :before{
       content:"${props.userSign}"
     }
     `};
    ${props =>
      props.filled &&
      `
     background: transparent; 
     :before{
      content:" "
    }
     `};
  }

  &.flash {
    -moz-animation: flash 1s ease-out;
    -moz-animation-iteration-count: 1;
    -webkit-animation: flash 1s ease-out;
    -webkit-animation-iteration-count: 1;
    -ms-animation: flash 1s ease-out;
    -ms-animation-iteration-count: 1;
    animation: flash 1s ease-out;
    animation-iteration-count: 1;
  }
  
  @-webkit-keyframes flash {
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
  
  @-moz-keyframes flash {
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
  
  @-ms-keyframes flash {
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

export default styledCell;
