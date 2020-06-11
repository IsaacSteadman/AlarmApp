import * as React from 'react';
import { render } from 'react-dom';

import { Toolbar, AppBar, Button, Table, TableContainer, TableHead, TableCell, TableBody, TableRow, Input, Fab, Container, Dialog, DialogTitle, makeStyles, IconButton, FormControlLabel, Checkbox, Select, FormControl, InputLabel, Grid, TextareaAutosize } from '@material-ui/core';
import { KeyboardTimePicker } from '@material-ui/pickers';
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';
import { padStart } from 'lodash';
import { bottomRightFabStyle } from './utils';
import { BaseAction, Action, ActionType, HttpMethod, HttpCredentials, HttpHeaders, FileActionType, FileWhence, CompositeSubActionType } from '../../common/models/Action';
import { hexStringToUint8Array, uint8ArrayToHexString } from '../../common/utils';
import { SimpleDataTable, RowType } from './SimpleDataTable';
import { DaySelector, DaySelectorType } from '../../common/models/Alarm';


export interface CommonProps {
}

export interface Props extends CommonProps {
  daySelectors: DaySelector[]
  onCreateDaySelector: (ds: DaySelector) => Promise<boolean> | boolean; // return true to confirm close
  onEditDaySelector: (ds: DaySelector) => Promise<boolean> | boolean;
}

export interface State extends CommonProps {
  show: 'none' | 'edit' | 'create';
  name: string;
  dialogType: DaySelectorType;
  exactDateMonth: number; // shared with exact-date and dmboowd
  exactDateDay: number; // shared with exact-date and dmboowd
  dowomMonth: number; // for donwom or ndowom
  dowomDayOfWeek: number; // for donwom or ndowom
  dowomN: number; // for donwom or ndowom
  dowafmadomStartMonth: number;
  dowafmadomStartDay: number;
  dowafmadomDayOfWeekAfterFullMoon: number;
  drtodDayName: string;
  drtodDayOffset: number;
}

export class DaySelectorEdit extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      show: 'none',
      name: '',
      dialogType: 'ndowom',
      exactDateMonth: 0,
      exactDateDay: 0,
      dowomMonth: 0,
      dowomDayOfWeek: 0,
      dowomN: 0,
      dowafmadomStartMonth: 0,
      dowafmadomStartDay: 0,
      dowafmadomDayOfWeekAfterFullMoon: 0,
      drtodDayName: '',
      drtodDayOffset: 0
    };
  }
  constructDaySelector(): DaySelector {
    const {
      name, dialogType,
      exactDateMonth, exactDateDay,
      dowomMonth, dowomDayOfWeek, dowomN,
      dowafmadomStartMonth, dowafmadomStartDay, dowafmadomDayOfWeekAfterFullMoon,
      drtodDayName, drtodDayOffset
    } = this.state;
    if (dialogType === 'donwom' || dialogType === 'ndowom') {
      return {
        name,
        type: dialogType,
        month: dowomMonth,
        dayOfWeek: dowomDayOfWeek,
        n: dowomN
      };
    } else if (dialogType === 'dmboowd' || dialogType === 'exact-date') {
      return {
        name,
        type: dialogType,
        month: exactDateMonth,
        day: exactDateDay
      };
    } else if (dialogType === 'dowafmadom') {
      return {
        name,
        type: 'dowafmadom',
        startMonth: dowafmadomStartMonth,
        startDay: dowafmadomStartDay,
        dayOfWeekAfterFullMoon: dowafmadomDayOfWeekAfterFullMoon
      };
    } else if (dialogType === 'drtod') {
      return {
        name,
        type: 'drtod',
        daysRelative: drtodDayOffset,
        relativeDay: {
          name: drtodDayName
        }
      }
    }
    throw new Error('unreachable');
  }
  openDaySelector(ds?: DaySelector) {
    this.setState({
      name: '',
      dialogType: 'ndowom',
      exactDateMonth: 0,
      exactDateDay: 0,
      dowomMonth: 0,
      dowomDayOfWeek: 0,
      dowomN: 0,
      dowafmadomStartMonth: 0,
      dowafmadomStartDay: 0,
      dowafmadomDayOfWeekAfterFullMoon: 0,
      drtodDayName: '',
      drtodDayOffset: 0
    })
    if (ds != null) {
      this.setState({
        show: 'edit',
        name: ds.name,
        dialogType: ds.type
      });
      if (ds.type === "donwom" || ds.type === 'ndowom') {
        this.setState({
          dowomDayOfWeek: ds.dayOfWeek,
          dowomMonth: ds.month,
          dowomN: ds.n
        });
      } else if (ds.type === 'dmboowd' || ds.type === 'exact-date') {
        this.setState({
          exactDateDay: ds.day,
          exactDateMonth: ds.month
        })
      } else if (ds.type === 'drtod') {
        this.setState({
          drtodDayName: ds.relativeDay.name,
          drtodDayOffset: ds.daysRelative
        });
      } else if (ds.type === 'dowafmadom') {
        this.setState({
          dowafmadomDayOfWeekAfterFullMoon: ds.dayOfWeekAfterFullMoon,
          dowafmadomStartDay: ds.startDay,
          dowafmadomStartMonth: ds.startMonth
        });
      }
      ds == null;
    } else {
      this.setState({
        show: 'create'
      });
    }
  }
  async editDaySelector() {
    const dayGroup = this.constructDaySelector();
    if (await this.props.onEditDaySelector(dayGroup)) {
      this.setState({ show: 'none' });
    }
  }
  async createDaySelector() {
    const dayGroup = this.constructDaySelector();
    if (await this.props.onCreateDaySelector(dayGroup)) {
      this.setState({ show: 'none' });
    }
  }
  render() {
    const {
      show, name, dialogType,
      exactDateMonth, exactDateDay,
      dowomMonth, dowomDayOfWeek, dowomN,
      dowafmadomStartMonth, dowafmadomStartDay, dowafmadomDayOfWeekAfterFullMoon,
      drtodDayName, drtodDayOffset
    } = this.state;
    const {
      daySelectors
    } = this.props;

    return (
      <Dialog
        open={show !== 'none'}
        onClose={() => this.setState({ show: 'none' })}
        fullWidth={true}
        maxWidth="xs"
      >
        <DialogTitle>{show === 'edit' ? 'Edit' : 'Create'} Day Selector</DialogTitle>
        <FormControlLabel
          label="Name"
          labelPlacement="top"
          control={<Input value={name} onChange={(e) => {
            this.setState({
              name: e.target.value
            });
          }} type="text" name="name" />}
        />
        <FormControlLabel
          label="Type"
          labelPlacement="top"
          control={
            <Select
              value={dialogType}
              onChange={(e) => this.setState({ dialogType: e.target.value as DaySelectorType })}
              name="type"
            >
              <option value="exact-date">Exact Date</option>
              <option value="donwom">Day of Nth Complete Week of Month </option>
              <option value="ndowom">Nth Day of Week of Month</option>
              <option value="dmboowd">Exact Date But Must Be Observed On Week Day</option>
              <option value="dowafmadom">Day of Week After Full Moon After Day Of Month</option>
              <option value="drtod">Day Offset Relative to Another Day</option>
            </Select>
          }
        />
        {
          dialogType === 'donwom' || dialogType === 'ndowom' ? (
            <>
              <div style={{ marginBottom: '1em', marginTop: '1em' }}>
                <center>Description</center>
                This should be read as: {
                  dialogType === 'ndowom'
                    ? 'The [N]th [Day Of Week] of [Month].'
                    : 'The [Day Of Week] of the [N]th complete week of [Month].'
                } <br />
                Note that N = 0 means "first day". <br />
                N &lt; 0 means the [abs(N)]th day/week of the month<br />
                For Example: N = -1 means the last day/week of the month <br />
                and N = -2 means the second to last day/week of the month.
              </div>
              <FormControlLabel
                label="Day Of Week"
                labelPlacement="top"
                control={
                  <Select
                    type="number"
                    name="dowomDayOfWeek"
                    value={'' + dowomDayOfWeek}
                    onChange={(e) => this.setState({ dowomDayOfWeek: +e.target.value })}
                  >
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                  </Select>
                }
              />
              <FormControlLabel
                label="N"
                labelPlacement="top"
                control={
                  <Input
                    type="number"
                    name="dowomN"
                    value={dowomN}
                    onChange={(e) => this.setState({ dowomN: +e.target.value })}
                  />
                }
              />
              <FormControlLabel
                label="Month"
                labelPlacement="top"
                control={
                  <Select
                    type="number"
                    name="dowomMonth"
                    value={'' + dowomMonth}
                    onChange={(e) => this.setState({ dowomMonth: +e.target.value })}
                  >
                    <option value="0">January</option>
                    <option value="1">February</option>
                    <option value="2">March</option>
                    <option value="3">April</option>
                    <option value="4">May</option>
                    <option value="5">June</option>
                    <option value="6">July</option>
                    <option value="7">August</option>
                    <option value="8">September</option>
                    <option value="9">October</option>
                    <option value="10">November</option>
                    <option value="11">December</option>
                  </Select>
                }
              />
            </>
          ) : ''
        }
        {
          dialogType === 'dmboowd' || dialogType === 'exact-date' ? (
            <>
              <div style={{ marginBottom: '1em', marginTop: '1em' }}>
                <center>Description</center>
                This should be read as: {
                  dialogType === 'exact-date'
                    ? 'The [Day]th of [Month].'
                    : 'The closest weekday to the of the [Day]th of [Month].'
                }
              </div>
              <FormControlLabel
                label="Month"
                labelPlacement="top"
                control={
                  <Select
                    type="number"
                    name="exactDateMonth"
                    value={'' + exactDateMonth}
                    onChange={(e) => this.setState({ exactDateMonth: +e.target.value })}
                  >
                    <option value="0">January</option>
                    <option value="1">February</option>
                    <option value="2">March</option>
                    <option value="3">April</option>
                    <option value="4">May</option>
                    <option value="5">June</option>
                    <option value="6">July</option>
                    <option value="7">August</option>
                    <option value="8">September</option>
                    <option value="9">October</option>
                    <option value="10">November</option>
                    <option value="11">December</option>
                  </Select>
                }
              />
              <FormControlLabel
                label="Day"
                labelPlacement="top"
                control={
                  <Input
                    type="number"
                    inputProps={
                      {
                        min: 1,
                        max: 31,
                        step: 1
                      }
                    }
                    name="exactDateDay"
                    value={exactDateDay + 1}
                    onChange={(e) => this.setState({ exactDateDay: +e.target.value - 1 })}
                  />
                }
              />
            </>
          ) : ''
        }
        {
          dialogType === 'dowafmadom' ? (
            <>
              <div style={{marginBottom: '1em', marginTop: '1em'}}>
                <center>Description</center>
                This should be read as the [Day Of Week] on or after the first full moon
                after the [Start Day]th of [Start Month].
              </div>
              <FormControlLabel
                label="Start Month"
                labelPlacement="top"
                control={
                  <Select
                    type="number"
                    name="dowafmadomStartMonth"
                    value={'' + dowafmadomStartMonth}
                    onChange={(e) => this.setState({ dowafmadomStartMonth: +e.target.value })}
                  >
                    <option value="0">January</option>
                    <option value="1">February</option>
                    <option value="2">March</option>
                    <option value="3">April</option>
                    <option value="4">May</option>
                    <option value="5">June</option>
                    <option value="6">July</option>
                    <option value="7">August</option>
                    <option value="8">September</option>
                    <option value="9">October</option>
                    <option value="10">November</option>
                    <option value="11">December</option>
                  </Select>
                }
              />
              <FormControlLabel
                label="Start Day"
                labelPlacement="top"
                control={
                  <Input
                    type="number"
                    inputProps={
                      {
                        min: 1,
                        max: 31,
                        step: 1
                      }
                    }
                    name="dowafmadomStartDay"
                    value={dowafmadomStartDay + 1}
                    onChange={(e) => this.setState({ dowafmadomStartDay: +e.target.value - 1 })}
                  />
                }
              />
              <FormControlLabel
                label="Day Of Week"
                labelPlacement="top"
                control={
                  <Select
                    type="number"
                    name="dowafmadomDayOfWeekAfterFullMoon"
                    value={'' + dowafmadomDayOfWeekAfterFullMoon}
                    onChange={(e) => this.setState({ dowafmadomDayOfWeekAfterFullMoon: +e.target.value })}
                  >
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                  </Select>
                }
              />
            </>
          ) : ''
        }
        {
          dialogType === 'drtod' ? (
            <>
              <div style={{marginBottom: '1em', marginTop: '1em'}}>
                <center>Description</center>
                A day offset of 0 means the same day. <br/>
                A day offset of 1 means the day after. <br/>
                A day offset of -1 means the day before.
              </div>
              <FormControlLabel
                label="Day Offset"
                labelPlacement="top"
                control={
                  <Input
                    type="number"
                    inputProps={{ step: 1 }}
                    name="drtodDayOffset"
                    value={drtodDayOffset}
                    onChange={(e) => this.setState({ drtodDayOffset: +e.target.value })}
                  />
                }
              />
              <FormControlLabel
                label="Relative Day Selector"
                labelPlacement="top"
                control={
                  <Select
                    type="number"
                    name="drtodDayName"
                    value={drtodDayName}
                    onChange={(e) => this.setState({ drtodDayName: e.target.value as string })}
                  >
                    {
                      daySelectors.map(ds => (
                        <option value={ds.name} key={`day-selector-edit-drtod-opt-${ds.name}`}>{ds.name}</option>
                      ))
                    }
                  </Select>
                }
              />
            </>
          ) : ''
        }
        {
          show === 'edit' ? (
            <Grid>
              <IconButton hidden={show !== 'edit'} style={{ color: 'green' }} onClick={() => this.editDaySelector()}>
                <DoneIcon />
              </IconButton>
              <IconButton hidden={show !== 'edit'} style={{ color: 'red' }} onClick={() => this.setState({ show: 'none' })}>
                <CloseIcon />
              </IconButton>
            </Grid>
          ) : ''
        }
        {
          show === 'create' ? (
            <Button
              hidden={show !== 'create'}
              variant="contained"
              color="primary"
              onClick={() => this.createDaySelector()}
            >Add</Button>
          ) : ''
        }
      </Dialog >
    );
  }
}
