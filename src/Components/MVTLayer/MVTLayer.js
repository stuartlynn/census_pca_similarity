import React from "react";
import {CartoQuery, columnsForQuery,geometryTypeForTable} from '../../utils.js'

const typeLookup={
  "ST_MultiPolygon": "fill",
  "ST_Polygon": "fill",
  "ST_Point": "circle",
  "ST_MultiPoint":"circle",
  "ST_LINESTRING": 'line',
  "ST_MULTILINESTRING": 'line',
  "ST_GeometryCollection": 'fill'
}

class MVTLayer extends React.Component{

  render(){
    return (<span></span>)
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.tileURL !== this.props.tileURL){
      this.updateLayer()
    }
    if(nextProps.selection !== this.props.selection){
      this.updateLayerSelection()
    }
    if(nextProps.style!== this.props.style){
      this.updateStyle(nextProps.style)
    }
    /*
     *if(nextProps.visibility!== this.props.visibility){
     *  console.log('viz changed')
     *  this.updateVisibility(nextProps.visibility)
     *}
     */
  }

  componentWillUnmount(){
    this.removeLayer()
  }

  componentDidMount(){
    const map  = this.props.map

    if(map){
      if(map._loaded){
        this.addLayer()
        this.updateVisibility()
      }


      map.on('load',()=>{
        this.addLayer()
        //this.updateVisibility()
      })
    }
  }

  updateVisibility(show= this.props.visibility){
    /*
     *this.props.map.setPaintProperty(
     *  this.props.name, 'visibility', show
     *)
     */
  }

  updateStyle(style=this.props.style){
      Object.keys(style).forEach(paintProperty =>{
        this.props.map.setPaintProperty(
          this.props.name,
          paintProperty, style[paintProperty]
        )
      })
  }

  removeLayer(layer = this){
    if(layer.props.map && layer.props.map.getLayer(layer.props.name)){
      this.props.map.removeLayer(layer.props.name)
      this.props.map.removeSource(layer.props.name)
    }
  }


  updateLayerSelection(){
    const selectionCriteria  = ['any'].concat( this.props.selection.map((id)=> ['==',['get','cartodb_id'], id] ))

    const unselectedStyle  = this.props.style
    const selectedStyle    = this.props.selectionStyle

    Object.keys(selectedStyle).forEach((property)=>{
      let combinedStyle = [ ]
      if(selectedStyle[property] !== unselectedStyle[property] ){
        combinedStyle = ['case',  selectionCriteria , selectedStyle[property], unselectedStyle[property] ]
        this.props.map.setPaintProperty(this.props.name,property,combinedStyle )
      }
    })
  }

  updateLayer(layer){
    this.removeLayer(layer)
    this.addLayer(layer)
  }

  addLayer(){
    const map = this.props.map
    if(!this.props.name){
      throw('need to name your layers')
    }

    if(!map){ return }
    try {
      let tiles = this.props.tileURL

      if(typeof(this.props.tileURL) === 'string'){
        tiles = [tiles]
      }

      map.addSource(this.props.name,{ type: this.props.layerType, tiles:tiles })

      map.addLayer({
        id: this.props.name,
        type: this.props.drawType,
        source: this.props.name,
        'source-layer': this.props.name,
        paint: this.props.style
      })
      if(this.props.onClick){
        map.on('click', this.props.name, (e)=>{
          this.props.onClick(e)
        })
      }
      if(this.props.onHover){
        map.on('mousemove', this.props.name, (e)=>{
          this.props.onHover(e)
        })
      }
    }
    catch(error){
      console.log("something went wrong adding the layer ", error)
    }
  }

  comonentWillUnmount(){
    this.removeSelf()
  }

}

export default MVTLayer
