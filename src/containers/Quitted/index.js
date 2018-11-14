import React from "react";
import H2 from "../../components/H2";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

const Quitted = () => {
  return (
    <div>
      <Helmet>
        <title>Your opponent quitted</title>
      </Helmet>
      <H2 color={"blue"}>Your opponent quitted, start a new game </H2>
      <Link to="/play">Start</Link>
    </div>
  );
};
export default Quitted;
