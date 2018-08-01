import React, { Component} from 'react';
import PropTypes from 'prop-types';

const DataContext = React.createContext();

class DataProvider extends Component {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
  };

  runCartoQuery(query){
    console.log(query)
    console.log(`https://observatory.carto.com/api/v2/sql?q=${query}`)
    return fetch(`https://observatory.carto.com/api/v2/sql?q=${query}`).then(r => r.json()).then(r=>r.rows)
  }
  fetchFeatureData(cartodbID){
    const values = valueColumns.join(',')
    return this.runCartoQuery(`select * from vector_data_with_pca10 where cartodb_id = ${cartodbID}`)
  }
  requestRegionData(cartodbID){
    fetchFeatureData(cartodbID).then((res)=>{
      this.setState({selectedAreaData:res[0]})
    })
  }

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <DataContext.Provider value={this.state}>
        {this.props.children}
      </DataContext.Provider>
    );
  }
}

export default DataProvider;
export const DataConsumer = DataContext.Consumer;
