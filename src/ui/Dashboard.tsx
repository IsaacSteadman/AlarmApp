import * as React from 'react';
import { render } from 'react-dom';

import { Toolbar, AppBar, Button } from '@material-ui/core';

export interface Props {
}

export interface State extends Props {
}

export class Dashboard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = Object.assign({}, props);
  }
  render() {
    return (
      <div>

      </div>
    )
  }
}
