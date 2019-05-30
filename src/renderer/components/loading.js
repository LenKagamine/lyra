// @flow strict

import * as React from 'react';
import { render } from 'react-dom';

type Props = {||};

class Loading extends React.Component<Props> {
  render() {
    return (
      <div className='loading-box'>
        <div className='loading' />
      </div>
    );
  }
}

export default Loading;
