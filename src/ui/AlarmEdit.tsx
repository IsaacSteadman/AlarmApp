import * as React from 'react';
import { render } from 'react-dom';

import { Toolbar, AppBar, Button, Table, TableContainer, TableHead, TableCell, TableBody, TableRow, Input, Fab, Container, Dialog, DialogTitle, makeStyles, IconButton, FormControlLabel, Checkbox, Select, FormControl, InputLabel, Grid } from '@material-ui/core';
import { KeyboardTimePicker } from '@material-ui/pickers';
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';
import { Alarm, DayGroup } from '../../common/models/Alarm';
import { padStart } from 'lodash';
import { bottomRightFabStyle } from './utils';
import { Action } from '../../common/models/Action';

function getDateHoursMinutes(): Date;
function getDateHoursMinutes(hours: number, minutes: number, isPM: boolean): Date;
function getDateHoursMinutes(hours: number, minutes: number): Date;
function getDateHoursMinutes(hours?: number, minutes?: number, isPM?: boolean): Date {
  const d = new Date();
  if (hours == null && isPM == null) {
    hours = d.getHours();
  } else if (hours == null) {
    hours = d.getHours();
    if (isPM) {
      if (hours < 12) hours += 12;
    } else {
      if (hours >= 12) hours -= 12;
    }
  } else if (isPM == null) {
  } else {
    if (isPM) {
      if (hours !== 12) {
        hours += 12;
      }
    } else {
      if (hours === 12) {
        hours = 0;
      }
    }
  }
  if (minutes == null) {
    minutes = d.getMinutes();
  }
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes);
}

// returns [hours, minutes, isPM]
function dateToHoursMinutesIsPM(d: Date): [number, number, boolean] {
  return (
    d.getHours() >= 12
      ? (
        d.getHours() === 12
          ? [12, d.getMinutes(), true]
          : [d.getHours() - 12, d.getMinutes(), true]
      )
      : (
        d.getHours() === 0
          ? [12, d.getMinutes(), false]
          : [d.getHours(), d.getMinutes(), false]
      )
  );
}

function newAlarmObject(d: Date): { alarmHours: number, alarmMinutes: number, alarmIsPM: boolean } {
  const [alarmHours, alarmMinutes, alarmIsPM] = dateToHoursMinutesIsPM(d);
  return { alarmHours, alarmMinutes, alarmIsPM };
}

export interface CommonProps {
}

export interface Props extends CommonProps {
  onCreateAlarm: (alarm: Alarm) => Promise<boolean> | boolean; // return true to confirm close
  onEditAlarm: (alarm: Alarm) => Promise<boolean> | boolean;
  dayGroups: DayGroup[];
  actions: Action[];
}

export interface State extends CommonProps {
  showDialog: boolean;
  alarmName: string;
  alarmAction: string;
  alarmPriority: number;
  alarmNegateAction: boolean;
  alarmIsSunday: boolean;
  alarmIsMonday: boolean;
  alarmIsTuesday: boolean;
  alarmIsWednesday: boolean;
  alarmIsThursday: boolean;
  alarmIsFriday: boolean;
  alarmIsSaturday: boolean;
  alarmDayGroup: string;
  alarmHours: number;
  alarmMinutes: number;
  alarmIsPM: boolean;
  dialogUseDow: boolean;
  show: 'none' | 'edit' | 'create';
}

export class AlarmEdit extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showDialog: false,
      alarmName: '',
      alarmAction: '',
      alarmPriority: 0,
      alarmNegateAction: false,
      alarmIsSunday: false,
      alarmIsMonday: false,
      alarmIsTuesday: false,
      alarmIsWednesday: false,
      alarmIsThursday: false,
      alarmIsFriday: false,
      alarmIsSaturday: false,
      alarmDayGroup: '',
      alarmHours: null,
      alarmMinutes: null,
      alarmIsPM: null,
      dialogUseDow: true,
      show: 'none'
      ...props
    };
  }
  constructAlarm(): Alarm {
    const {
      alarmName, alarmAction, alarmPriority, alarmNegateAction,
      alarmIsSunday, alarmIsMonday, alarmIsTuesday, alarmIsWednesday,
      alarmIsThursday, alarmIsFriday, alarmIsSaturday, alarmDayGroup, alarmHours,
      alarmMinutes, alarmIsPM, dialogUseDow
    } = this.state;
    return {
      type: 'basic',
      name: alarmName,
      action: {
        name: alarmAction
      },
      negateAction: alarmNegateAction,
      priority: alarmPriority,
      days: (
        dialogUseDow
          ? {
            type: 'dow',
            daysOfWeek: [
              alarmIsSunday,
              alarmIsMonday,
              alarmIsTuesday,
              alarmIsWednesday,
              alarmIsThursday,
              alarmIsFriday,
              alarmIsSaturday
            ]
          } : {
            type: 'day-group',
            group: {
              name: alarmDayGroup
            }
          }
      ),
      hour: alarmHours,
      isPM: alarmIsPM,
      minute: alarmMinutes
    };
  }
  openAlarm(alarm?: Alarm) {
    if (alarm == null) {
      this.setState({
        show: 'create',
        ...newAlarmObject(new Date())
      });
    } else {
      this.setState({
        show: 'edit',
        alarmName: alarm.name,
        alarmAction: alarm.action.name,
        alarmHours: alarm.hour,
        alarmIsPM: alarm.isPM,
        alarmMinutes: alarm.minute,
        alarmNegateAction: alarm.negateAction,
        dialogUseDow: alarm.days.type === 'dow',
        alarmPriority: alarm.priority
      });
      if (alarm.days.type === 'dow') {
        console.log('alarm.name =', alarm.name, 'alarm.days.daysOfWeek =', alarm.days.daysOfWeek);
        this.setState({
          alarmIsSunday: alarm.days.daysOfWeek[0],
          alarmIsMonday: alarm.days.daysOfWeek[1],
          alarmIsTuesday: alarm.days.daysOfWeek[2],
          alarmIsWednesday: alarm.days.daysOfWeek[3],
          alarmIsThursday: alarm.days.daysOfWeek[4],
          alarmIsFriday: alarm.days.daysOfWeek[5],
          alarmIsSaturday: alarm.days.daysOfWeek[6]
        });
      } else {
        this.setState({
          alarmDayGroup: alarm.days.group.name
        });
      }
    }
  }
  async editAlarm() {
    const alarm = this.constructAlarm();
    if (await this.props.onEditAlarm(alarm)) {
      this.setState({ show: 'none' });
    }
  }
  async createAlarm() {
    const alarm = this.constructAlarm();
    if (await this.props.onCreateAlarm(alarm)) {
      this.setState({ show: 'none' });
    }
  }
  render() {
    const {
      alarmName, alarmAction, alarmPriority, alarmNegateAction,
      alarmIsSunday, alarmIsMonday, alarmIsTuesday, alarmIsWednesday,
      alarmIsThursday, alarmIsFriday, alarmIsSaturday, alarmDayGroup, alarmHours,
      alarmMinutes, alarmIsPM, dialogUseDow, show
    } = this.state;
    const { dayGroups, actions } = this.props;
    return (
      <Dialog
        open={show !== 'none'}
        onClose={() => this.setState({ show: 'none' })}
        fullWidth={true}
        maxWidth="xs"
      >
        <DialogTitle>Create Alarm</DialogTitle>
        <FormControlLabel
          label="Name"
          labelPlacement="top"
          control={<Input value={alarmName} onChange={(e) => {
            this.setState({
              alarmName: e.target.value
            });
          }} type="text" name="name" />} />
        <FormControlLabel
          label="Action"
          labelPlacement="top"
          control={
            <Select
              value={alarmAction}
              onChange={(e) => {
                this.setState({
                  alarmAction: e.target.value as string
                });
              }}
              name="action"
            >
              {
                actions.map(action => (
                  <option key={`alarm-edit-action-opt-${action.name}`} value={action.name}>{action.name}</option>
                ))
              }
            </Select>
          }
        />
        <FormControl>
          <InputLabel htmlFor="alarm-edit-negate-action">Negate Action</InputLabel>
          <Select
            value={alarmNegateAction ? '1' : '0'}
            onChange={e => this.setState({ alarmNegateAction: +e.target.value === 1 })}
            inputProps={{ id: 'alarm-edit-negate-action' }}
          >
            <option value="0">Run</option>
            <option value="1">Cancel</option>
          </Select>
        </FormControl>
        <FormControlLabel
          label="Priority"
          labelPlacement="top"
          control={
            <Input
              value={alarmPriority}
              onChange={e => this.setState({ alarmPriority: +e.target.value })}
              type="number"
            />
          }
        />
        <KeyboardTimePicker
          label={<span style={{ fontSize: '24px' }}>Time</span>}
          value={getDateHoursMinutes(alarmHours, alarmMinutes, alarmIsPM)}
          placeholder="08:00 AM"
          mask="__:__ _M"
          onChange={(date) => this.setState(newAlarmObject(date))}
        />
        <FormControlLabel
          label="Use Days of the Week"
          labelPlacement="top"
          control={
            <Checkbox
              checked={dialogUseDow}
              onChange={e => this.setState({ dialogUseDow: e.currentTarget.checked })}
            />
          }
        />
        {
          dialogUseDow ? (
            <Grid container>
              <FormControlLabel
                label="Sun"
                labelPlacement="start"
                control={
                  <Checkbox
                    checked={alarmIsSunday}
                    onChange={e => this.setState({ alarmIsSunday: e.target.checked })}
                  />
                }
              />
              <FormControlLabel
                label="Mon"
                labelPlacement="start"
                control={
                  <Checkbox
                    checked={alarmIsMonday}
                    onChange={e => this.setState({ alarmIsMonday: e.target.checked })}
                  />
                }
              />
              <FormControlLabel
                label="Tues"
                labelPlacement="start"
                control={
                  <Checkbox
                    checked={alarmIsTuesday}
                    onChange={e => this.setState({ alarmIsTuesday: e.target.checked })}
                  />
                }
              />
              <FormControlLabel
                label="Wed"
                labelPlacement="start"
                control={
                  <Checkbox
                    checked={alarmIsWednesday}
                    onChange={e => this.setState({ alarmIsWednesday: e.target.checked })}
                  />
                }
              />
              <FormControlLabel
                label="Thu"
                labelPlacement="start"
                control={
                  <Checkbox
                    checked={alarmIsThursday}
                    onChange={e => this.setState({ alarmIsThursday: e.target.checked })}
                  />
                }
              />
              <FormControlLabel
                label="Fri"
                labelPlacement="start"
                control={
                  <Checkbox
                    checked={alarmIsFriday}
                    onChange={e => this.setState({ alarmIsFriday: e.target.checked })}
                  />
                }
              />
              <FormControlLabel
                label="Sat"
                labelPlacement="start"
                control={
                  <Checkbox
                    checked={alarmIsSaturday}
                    onChange={e => this.setState({ alarmIsSaturday: e.target.checked })}
                  />
                }
              />
            </Grid>
          ) : (
              <FormControlLabel
                label="Day Group Name"
                labelPlacement="top"
                hidden={dialogUseDow}
                control={
                  <Select value={alarmDayGroup} onChange={e => this.setState({ alarmDayGroup: e.currentTarget.value as string })}>
                    {
                      dayGroups.map(dayGroup => (
                        <option key={`alarm-edit-day-group-opt-${dayGroup.name}`} value={dayGroup.name}>{dayGroup.name}</option>
                      ))
                    }
                  </Select>
                }
              />
            )
        }
        {
          show === 'edit' ? (
            <Grid>
              <IconButton style={{ color: 'green' }} onClick={() => this.editAlarm()}>
                <DoneIcon />
              </IconButton>
              <IconButton style={{ color: 'red' }} onClick={() => this.setState({ show: 'none' })}>
                <CloseIcon />
              </IconButton>
            </Grid>
          ) : ''
        }
        {
          show === 'create' ? (
            <Button variant="contained" color="primary" onClick={() => this.createAlarm()}>Add</Button>
          ) : ''
        }
      </Dialog>);
  }
}
