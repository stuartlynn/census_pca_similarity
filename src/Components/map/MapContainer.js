import React from "react";
import Map from './Map.js'
import CartoVLLayer from './CartoVLLayer.js'
import {MapConsumer} from '../../Contexts/MapProvider'
//const cartoVLInstance = require('@carto/carto-vl');

class MapContainer extends React.Component{
  render(){

    return (
      <MapConsumer>
        {context => (
        <Map
          zoom={context.zoom}
          center={context.center}
          basemap = {context.basemap}
          mapboxGLToken= {context.mapboxtoken}
        >
          <CartoVLLayer
            username= {context.username}
            apiKey = {context.apiKey}
            host='carto'
            name='similarity'
            query = {context.query}
            style = {context.style}
            visibility= {true}
            onClick={(s)=>context.setSelectedFeature(s)}
          />
        </Map>
        )}
      </MapConsumer>
    )
  }
}

const mapStyle = (state)=>{
}


export default MapContainer
