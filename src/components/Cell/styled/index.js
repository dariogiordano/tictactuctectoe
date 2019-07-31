import styled from "styled-components";

const styledCell = styled.div`
  display: inline-block;
  width: 28px;
  height: 28px;
  text-align: center;
  line-height: 30px;
  border: 1px solid #ddd;
  color: ${props => props.color};
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
     background: rgba(0,255,0,0.5); 
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
`;

export default styledCell;
