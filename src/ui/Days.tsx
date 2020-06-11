import * as React from 'react';
import { render } from 'react-dom';

import { Toolbar, AppBar, Button, Table, TableContainer, TableHead, TableCell, TableBody, TableRow, Input, Fab, Container, Dialog, DialogTitle, makeStyles, IconButton } from '@material-ui/core';
import { KeyboardTimePicker } from '@material-ui/pickers';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { DayGroup, DaySelector, WeekDayGroupSelector, DayOfNthWeekOfMonthSelector, NthDayOfWeekOfMonthSelector, ExactDateDaySelector, DayMustBeObservedOnWeekDaySelector, DayRelativeToOtherDaySelector, DayOfWeekAfterFullMoonAfterDayOfMonthSelector, dayToString, selectNextDay } from '../../common/models/Alarm';
import { padStart } from 'lodash';
import { bottomRightFabStyle } from './utils';
import { DaySelectorEdit } from './DaySelectorEdit';

export interface CommonProps {
}

export interface Props extends CommonProps {
  daySelectors: DaySelector[];
  onCreateDaySelector: (ds: DaySelector) => Promise<boolean> | boolean;
  onEditDaySelector: (ds: DaySelector) => Promise<boolean> | boolean;
}

export interface State extends CommonProps {
}

export class DaySelectors extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }
  render() {
    const { daySelectors, onCreateDaySelector, onEditDaySelector } = this.props;
    let daySelectorEdit: DaySelectorEdit;
    return (
      <TableContainer>
        <Table className="actionTable">
          <TableHead>
            <TableRow>
              <TableCell>Day Name</TableCell>
              <TableCell>Day/Month specifier</TableCell>
              <TableCell>Date of next occurence</TableCell>
              <TableCell colSpan={2}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              daySelectors.map(day => (
                <TableRow key={`days-row-${day.name}`}>
                  <TableCell>{day.name}</TableCell>
                  <TableCell>{dayToString(day)}</TableCell>
                  <TableCell>{'' + selectNextDay(new Date(), day)}</TableCell>
                  <TableCell>
                    <IconButton style={{ color: 'black' }} onClick={() => daySelectorEdit.openDaySelector(day)}>
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
        <DaySelectorEdit
          daySelectors={daySelectors}
          onCreateDaySelector={onCreateDaySelector}
          onEditDaySelector={onEditDaySelector}
          ref={e => daySelectorEdit = e}
        />
        <Fab color="primary" style={bottomRightFabStyle} onClick={() => daySelectorEdit.openDaySelector(null)}>
          <AddIcon />
        </Fab>
      </TableContainer>
    )
  }
}
