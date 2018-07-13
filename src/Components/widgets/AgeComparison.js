import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {MapConsumer} from '../../Contexts/MapProvider';
import * as d3 from 'd3';

class AgeComparison extends Component {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.createChart= this.createChart.bind(this)
  }

  componentDidMount(){
    this.createChart()
  }

  componentDidUpdate() {
    this.createChart()
  }

  createChart(){
    const node = this.node

  }
  render() {
    return <svg ref={node => (this.node = node)} width={500} height={500} />;
  }
}

export default AgeComparison;
