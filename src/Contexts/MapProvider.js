import React, {Component} from 'react';
import PropTypes from 'prop-types';

const MapContext = React.createContext();
const GeoTable = 'obs_87a814e485deabe3b12545a537f693d16ca702c2';
const ValsTable = 'obs_9effa577f8b5d674d620dfbaf4aec55e70ac06b8';

const columns = [
  'age_10_14',
  'age_15_17',
  'age_18_19',
  'age_20_20',
  'age_21_21',
  'age_22_24',
  'age_25_29',
  'age_30_34',
  'age_35_39',
  'age_40_44',
  'age_45_49',
  'age_50_54',
  'age_55_59',
  'age_5_9',
  'age_65_66',
  'age_67_69',
  'age_70_74',
  'age_75_79',
  'age_80_84',
  //'female_10_to_14',
  //'female_15_to_17',
  //'female_18_to_19',
  //'female_20',
  //'female_21',
  //'female_22_to_24',
  //'female_25_to_29',
  //'female_30_to_34',
  //'female_35_to_39',
  //'female_40_to_44',
  //'female_45_to_49',
  //'female_50_to_54',
  //'female_55_to_59',
  //'female_5_to_9',
  //'female_60_to_61',
  //'female_62_to_64',
  //'female_65_to_66',
  //'female_67_to_69',
  //'female_70_to_74',
  //'female_75_to_79',
  //'female_80_to_84',
  //'geoid',
  //'households',
  //'income_100000_124999',
  //'income_10000_14999',
  //'income_125000_149999',
  //'income_150000_199999',
  //'income_15000_19999',
  //'income_200000_or_more',
  //'income_20000_24999',
  //'income_25000_29999',
  //'income_30000_34999',
  //'income_35000_39999',
  //'income_40000_44999',
  //'income_45000_49999',
  //'income_50000_59999',
  //'income_60000_74999',
  //'income_75000_99999',
  //'income_per_capita',
  //'male_10_to_14',
  //'male_15_to_17',
  //'male_18_to_19',
  //'male_20',
  //'male_21',
  //'male_22_to_24',
  //'male_25_to_29',
  //'male_30_to_34',
  //'male_35_to_39',
  //'male_40_to_44',
  //'male_45_to_49',
  //'male_45_to_64',
  //'male_50_to_54',
  //'male_55_to_59',
  //'male_5_to_9',
  //'male_65_to_66',
  //'male_67_to_69',
  //'male_70_to_74',
  //'male_75_to_79',
  //'male_80_to_84',
  //'pca_0',
  //'pca_1',
  //'pca_2',
  //'pca_3',
  //'pca_4',
  //'pca_5',
  //'pca_6',
  //'pca_7',
  //'pca_8',
  //'pca_9',
  //'median_income',
  //'pc_married_households',
  //'percent_income_spent_on_rent',
  //'total_pop',
];

const var_list = columns.map(c => `@${c} : $${c}`).join('\n');
class MapProvider extends Component {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
  };
  state = {
    query: 'select * from vector_data_with_pca10',
    //query: `select total_pop, geo.the_geom, geo.the_geom_webmercator, geo.cartodb_id from ${GeoTable} as geo, ${ValsTable} as vals
    //where vals.geoid = geo.geoid`,
    //query: `select ${columns.join(',')},
    //geo.the_geom, geo.geoid,geo.cartodb_id, geo.the_geom_webmercator
    //FROM ${GeoTable}  as geo,
    //${ValsTable} as vals
    //where total_pop > 0 and male_pop >0 and female_pop >0 and households >0
    //and vals.geoid = geo.geoid
    //`,
    selecteFeature: null,
    //style:`
      //color: red
      //strokeWidth: 0.2
    //`,
    style: `
      ${var_list}
      @val: $pca_0
      color: ramp(linear(@val, 0,100),Earth)
      strokeWidth:0
    `,
    center: [-74.006, 40.7128],
    mapboxtoken:
      'pk.eyJ1Ijoic3R1YXJ0LWx5bm4iLCJhIjoiM2Q4ODllNmRkZDQ4Yzc3NTBhN2UyNDE0MWY2OTRiZWIifQ.8OEKvgZBCCtDFUXkjt66Pw',
    basemap: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    zoom: 16,
    username: 'observatory',
    apiKey: '',
    setSelectedFeature: this.setSelectedFeature.bind(this),
    setHoveredFeature: this.setHoveredFeature.bind(this)
  };
  generateStylePCA(feature,n_componets){
    const baseStyle= `
      ${var_list}
      stokeWidth:0
    `
    if(feature){
      const dist = [...Array(10).keys()].map((i)=> `pow(@pca_${i} - ${feature[`pca_${i}`]},2)`)
      return `
      ${baseStyle}
        color : ramp(linear( sqrt(${dist.join(' + ')}),0,1),Earth)
        strokeWidth: 0
      `
    }
    else{
      return `
        ${baseStyle}
        color:red
      `
    }
  }
  generateStyle(feature) {
    const baseStyle = `
      ${var_list}
      strokeWidth:0
    `;

    const magA = Math.sqrt(Object.values(feature).reduce((r, a) => r + a * a, 0));
    const magB = Object.keys(feature)
      .map(k => `@${k} * @${k}`)
      .join(' + ');

    const dp = Object.entries(feature)
      .map(f => `@${f[0]}*${f[1]}`)
      .join(' + ');

    console.log('target feature mag ', magA);
    console.log('dp ', dp);

    if (feature) {
      return `
      ${baseStyle}
      @magA : ${magA}
      @magB : sqrt(${magB})
      @dotP : ${dp}
      @val  : @dotP/@magA/@magB
      color: ramp(linear( @val, -1,1),Earth)
      `;
    } else {
      return `
        ${baseStyle}
        color:red
      `;
    }
  }
  setQuery(feature){

  }
  extractSelectionVariables(feature){
    const variables = Object.entries(feature.variables).reduce((r, p) => {
      if (columns.includes(p[0])) {
        r[p[0]] = p[1].value;
      }
      return r;
    }, {});
    return variables
  }
  setHoveredFeature(feature) {
    this.setState({
      hoveredFeature: this.extractSelectionVariables(feature),
    });
  }
  setSelectedFeature(feature) {
    console.log("SELECTED FEATUERS")
    const variables = this.extractSelectionVariables(feature)
    this.setState({
      selecteFeature: variables,
      style: this.generateStylePCA(variables,10)
    });
  }
  render() {
    return (
      <MapContext.Provider value={this.state}>
        {this.props.children}
      </MapContext.Provider>
    );
  }
}

export default MapProvider;
export const MapConsumer = MapContext.Consumer;
