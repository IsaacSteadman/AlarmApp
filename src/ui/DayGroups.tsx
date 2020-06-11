import * as React from 'react';
import { render } from 'react-dom';

import { Toolbar, AppBar, Button, Table, TableContainer, TableHead, TableCell, TableBody, TableRow, Input, Fab, Container, Dialog, DialogTitle, makeStyles, IconButton } from '@material-ui/core';
import { KeyboardTimePicker } from '@material-ui/pickers';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { DayGroup, DaySelector } from '../../common/models/Alarm';
import { padStart } from 'lodash';
import { bottomRightFabStyle } from './utils';
import { DayGroupEdit } from './DayGroupEdit';

export interface CommonProps {
}

export interface Props extends CommonProps {
  dayGroups: DayGroup[];
  daySelectors: DaySelector[];
  onCreateDayGroup: (dayGroup: DayGroup) => Promise<boolean> | boolean; // return true to confirm close
  onEditDayGroup: (dayGroup: DayGroup) => Promise<boolean> | boolean;
}

export interface State extends CommonProps {
}

export class DayGroups extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }
  render() {
    const { dayGroups, daySelectors, onCreateDayGroup, onEditDayGroup } = this.props;
    let dayGroupEdit: DayGroupEdit;
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
                <TableRow key={`day-group-row-${dayGroup.name}`}>
                  <TableCell>{dayGroup.name}</TableCell>
                  <TableCell>{dayGroup.days.map(x => x.name).join(',')}</TableCell>
                  <TableCell>
                    <IconButton style={{ color: 'black' }} onClick={() => dayGroupEdit.openDayGroup(dayGroup)}>
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
        <DayGroupEdit
          daySelectors={daySelectors}
          onCreateDayGroup={onCreateDayGroup}
          onEditDayGroup={onEditDayGroup}
          ref={e => dayGroupEdit = e}
        />
        <Fab color="primary" style={{ ...bottomRightFabStyle }} onClick={() => dayGroupEdit.openDayGroup(null)}>
          <AddIcon />
        </Fab>
      </TableContainer>
    )
  }
}
