import React, { Component } from "react";

import { BrowserRouter as Router, Route } from "react-router-dom";

import Home from "./containers/Home";
import Playground from "./containers/Playground";
import Quitted from "./containers/Quitted";

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Route path="/" exact component={Home} />
          <Route path="/play/" exact component={Playground} />
          <Route path="/play/:roomName" exact component={Playground} />
          <Route path="/quitted/" exact component={Quitted} />
        </div>
      </Router>
    );
  }
}

export default App;
