import React, { Component} from 'react';
import PropTypes from 'prop-types';
//import * as carto from '@carto/carto-vl/dist/carto-vl.min.js'

let carto = window.carto
class CartoVLLayer extends Component {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
  };

  componentWillReceiveProps(nextProps) {
    if(nextProps.apiKey !== this.props.apiKey ||
       nextProps.username !== this.props.username
       ){
       if(nextProps.query && nextProps.username && nextProps.apiKey){
         console.log('THE QUERY CHANGED')
         this.setUpSource(nextProps)
         this.addLayer()
       }
    }
    if(nextProps.query !== this.props.query){
      this.setQuery(nextProps)
    }
    if(nextProps.visibility  !== this.props.visibility){
      console.log("THE VISIBILITY CHANGED")
      if(this.props.map){
        this.updateVisibility(nextProps.visibility,nextProps.style)
      }
    }
    else if(nextProps.style !== this.props.style){
      console.log("THE STYLING CHANGED", nextProps.style)
      this.updateStyle(nextProps.style)
    }
  }

  setQuery(props){
    console.log("SETTING QUERY ")
    if(this.layer){
      this.source = new carto.source.SQL(
        props.query,
        {
          user: props.username,
          apiKey: props.apiKey
        },
        {
          serverURL:`https://{user}.${props.host}.com`
        });
      this.layer.update(this.source, this.layer.getViz())
    }
  }

  updateVisibility(viz, style = this.props.style){
      if(viz){
        this.updateStyle(style)
      }
      else{
        this.updateStyle('filter: 0')
      }
  }

  updateStyle(style=this.props.style){
    if(this.layer){
      setTimeout(()=>{
        this.layer.blendToViz(new carto.Viz(style))
      },0)
    }
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if(this.props.map){
      if(this.props.map.loaded() && this.props.query && this.props.username && this.props.apiKey){
        this.setUpSource(this.props)
        this.addLayer()
      }
      this.props.map.on('load',()=>{
        if(this.props.query && this.props.username && this.props.apiKey){
          this.setUpSource()
          this.addLayer()
        }
        //this.updateVisibility()
      })
    }
  }

  addLayer(){

    let style = "color: rgba(0,0,0,0)"
    if (this.props.visibility){
      style = this.props.style
    }
    console.log("STYLE IS ",style, ' query', this.source)

    this.layer = new carto.Layer(this.props.name, this.source, new carto.Viz(style));
    this.interactivity = new carto.Interactivity(this.layer);

    this.interactivity.on('featureClick', event => {
      if(this.props.onClick){
        if (event.features.length > 0) {
          const feature = event.features[0];
          this.props.onClick(feature)
        }
      }
    });

    this.interactivity.on('featureEnter', event => {
      if(this.props.onHover){
        if (event.features.length > 0) {
          const feature = event.features[0];
          this.props.onHover(feature)
        }
      }
    });

    if (this.props.after){
       this.layer.addTo(this.props.map, this.props.after )
    }
    else{
      const layers = this.props.map.getStyle().layers;
      const lastLayer = layers[layers.length-1].id
      this.layer.addTo(this.props.map, lastLayer)
    }
  }

  removeLayer(){
    try{
      this.props.map.removeLayer(this.props.name)
    }
    catch(err){
      console.log('no previous layer')
    }
  }
  componentWillUnmount() {
    this.removeLayer()
  }

  setUpSource(props=this.props){
    const host = this.props.host ? this.props.host : 'carto-staging'
    console.log("USING HOST ",host)
    console.log('query is ', props.query)
    this.source = new carto.source.SQL(
      props.query,
      {
        user: props.username,
        apiKey: props.apiKey
      },
      {
        serverURL:`https://{user}.${host}.com`
      });
    if(this.layer){
     this.layer.update(this.source, this.layer.getViz())
    }
  }

  render() {
    return (
      <span />
    );
  }
}


export default CartoVLLayer;
