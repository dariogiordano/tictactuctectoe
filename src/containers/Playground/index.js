import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Grid from "../../components/Grid";
import Container from "./styled";
class Playground extends React.Component {
  render() {
    return (
      <Container>
        <Helmet>
          <title>Home</title>
        </Helmet>
        <Link to="/">back</Link>
        <Grid history={this.props.history} />
      </Container>
    );
  }
}
export default Playground;
