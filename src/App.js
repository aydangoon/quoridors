import logo from './logo.svg';
import './App.css';
import Game from './game';
import React from 'react';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      N: 5,
      numPlayers: 2,
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
