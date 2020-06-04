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
}

export interface Props extends CommonProps {
  dayGroups: DayGroup[];
}

export interface State extends CommonProps {
}

export class DayGroups extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }
  render() {
    const { dayGroups } = this.props;
    return (
      <TableContainer>
        <Table className="actionTable">
          <TableHead>
            <TableRow>
              <TableCell>Day Group Name</TableCell>
              <TableCell>Days Included</TableCell>
              <TableCell colSpan={2}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              dayGroups.map(dayGroup => (
                <TableRow>
                  <TableCell>{dayGroup.name}</TableCell>
                  <TableCell>{dayGroup.days.map(x => x.name).join(',')}</TableCell>
                  <TableCell>
                    <IconButton style={{ color: 'black' }}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton color="secondary">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
        <Fab color="primary" style={{ ...bottomRightFabStyle }}>
          <AddIcon />
        </Fab>
      </TableContainer>
    )
  }
}
