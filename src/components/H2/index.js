import styled from "styled-components";

const H2 = styled.h2`
  font-size: 1.5em;
  color: ${props => props.color};
  &:hover {
    cursor: pointer;
    color: #6cc0e5;
  }
`;

export default H2;
