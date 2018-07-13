import React, { Component} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components'
import AgeComparison from './widgets/AgeComparison'

const StatsOuter = styled.div`
  position: absolute;
  right:0px;
  top:0px;
  width:300px;
  height:100%;
  background-color:white;
  box-sizing: border-box;
  padding:20px
`

class StatsContainer extends Component {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <StatsOuter>
        <AgeComparison />
      </StatsOuter>
    );
  }
}

export default StatsContainer;
