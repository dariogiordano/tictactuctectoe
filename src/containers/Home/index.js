import React from "react";
import H2 from "../../components/H2";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <Helmet>
        <title>Home</title>
      </Helmet>
      <H2 color={"blue"}>Home </H2>
      <Link to="/play">Play</Link>
    </div>
  );
};
export default Home;
