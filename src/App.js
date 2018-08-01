import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import MapContainer from  './Components/map/MapContainer'
import StatsContainer from  './Components/StatsContainer'
import MapProvider from './Contexts/MapProvider'

class App extends Component {
  render() {
    return (
      <div className="App">
        <MapProvider>
          <MapContainer/>
        </MapProvider>
      </div>
    );
  }
}

export default App;
