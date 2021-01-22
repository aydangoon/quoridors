import logo from './logo.svg';
import './App.css';
import Quoridors from './quoridors';
import React from 'react';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      numSides: 40,
      numPlayers: 4,
      inGame: true
    };
  }
  render() {
    return (
      <div>
        {this.state.inGame ? <Quoridors {...this.state}/> : <div />}
      </div>
    );
  }
}
