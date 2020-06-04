import * as React from 'react';
import { render } from 'react-dom';

import { Toolbar, AppBar, Button, Table, TableContainer, TableHead, TableCell, TableBody, TableRow, Input, Fab, Container, Dialog, DialogTitle, makeStyles, IconButton } from '@material-ui/core';
import { KeyboardTimePicker } from '@material-ui/pickers';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { DayGroup } from '../../common/models/Alarm';
import { padStart } from 'lodash';
import { bottomRightFabStyle } from './utils';

export interface CommonProps {
  dayGroups: DayGroup[];
}

export interface Props extends CommonProps {
}

export interface State extends CommonProps {
}

export class DayGroupsSelectorUi extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { ...props };
  }
  render() {
    const { dayGroups } = this.state;
    return (
      <>
        hello
      </>
    );
  }
}
