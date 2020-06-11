import * as React from 'react';
import { render } from 'react-dom';

import { Toolbar, AppBar, Button, Table, TableContainer, TableHead, TableCell, TableBody, TableRow, Input, Fab, Container, Dialog, DialogTitle, makeStyles, IconButton, FormControlLabel, Checkbox, Select } from '@material-ui/core';
import { KeyboardTimePicker } from '@material-ui/pickers';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { Alarm, DayGroup } from '../../common/models/Alarm';
import { padStart } from 'lodash';
import { bottomRightFabStyle } from './utils';
import { AlarmEdit } from './AlarmEdit';

const idxToDayAbrev = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat'
];

function formatTime(hour: number, minute: number, isPM: boolean): string {
  return `${padStart('' + hour, 2, '0')}:${padStart('' + minute, 2, '0')} ${isPM ? 'PM' : 'AM'}`;
}

export interface CommonProps {
}

export interface Props extends CommonProps {
  alarms: Alarm[];
  dayGroups: DayGroup[];
  actions: Action[];
  onCreateAlarm: (alarm: Alarm) => Promise<boolean> | boolean; // return true to confirm close
  onEditAlarm: (alarm: Alarm) => Promise<boolean> | boolean;
}

export interface State extends CommonProps {
}

export class Alarms extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }
  render() {
    const { alarms, dayGroups, actions, onEditAlarm, onCreateAlarm } = this.props;
    let alarmEdit: AlarmEdit;
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <TableContainer>
          <Table className="actionTable">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Alarm Priority</TableCell>
                <TableCell colSpan={2}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alarms.filter(alarm => alarm.type === 'basic').map(alarm => {
                return (
                  <TableRow key={`alarms-row-${alarm.name}`}>
                    <TableCell>
                      {alarm.name}
                    </TableCell>
                    <TableCell>
                      {
                        (() => {
                          if (alarm.days.type === 'dow') {
                            return alarm.days.daysOfWeek
                              .map((x, i) => ({ present: x, day: idxToDayAbrev[i] }))
                              .filter(obj => obj.present)
                              .map(obj => obj.day)
                              .join(', ');
                          } else {
                            return alarm.days.group.name;
                          }
                        })()
                      }
                    </TableCell>
                    <TableCell>
                      {formatTime(alarm.hour, alarm.minute, alarm.isPM)}
                    </TableCell>
                    <TableCell>
                      {alarm.action.name}
                    </TableCell>
                    <TableCell>
                      {alarm.priority} {alarm.negateAction ? 'Cancel' : 'Run'}
                    </TableCell>
                    <TableCell>
                      <IconButton style={{ color: 'black' }} onClick={() => alarmEdit.openAlarm(alarm)}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <IconButton color="secondary">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
              }
            </TableBody>
          </Table>
        </TableContainer>
        <AlarmEdit
          ref={e => alarmEdit = e}
          onEditAlarm={onEditAlarm}
          onCreateAlarm={onCreateAlarm}
          dayGroups={dayGroups}
          actions={actions}
        />
        <Fab
          style={bottomRightFabStyle}
          color="primary"
          aria-label="add"
          onClick={() => alarmEdit.openAlarm(null)}
        >
          <AddIcon />
        </Fab>
      </div >
    )
  }
}
