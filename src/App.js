import logo from './logo.svg';
import './App.css';
import Game from './game';
import React from 'react';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      N: 7,
      numPlayers: 4,
      inGame: true
    };
  }
  render() {
    return (
      <div>
        {this.state.inGame ? <Game {...this.state}/> : <div />}
      </div>
    );
  }
}
