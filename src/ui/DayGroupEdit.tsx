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
import { DaySelector, DayGroup } from '../../common/models/Alarm';



interface DaysIncludedRow extends RowType {
  name: string;
}

function daysIncludedToDays(rows: DaysIncludedRow[]): { name: string }[] {
  return rows.map(row => ({
    name: row.name
  }));
}

function daysToDaysIncluded(rows: (DaySelector | { name: string })[]): DaysIncludedRow[] {
  return rows.map(row => ({
    editing: null,
    hasBeenCompletedOnce: true,
    name: row.name
  }));
}

export interface CommonProps {
}

export interface Props extends CommonProps {
  daySelectors: DaySelector[]
  onCreateDayGroup: (dayGroup: DayGroup) => Promise<boolean> | boolean; // return true to confirm close
  onEditDayGroup: (dayGroup: DayGroup) => Promise<boolean> | boolean;
}

export interface State extends CommonProps {
  show: 'none' | 'edit' | 'create';
  name: string;
  daysIncluded: DaysIncludedRow[];
}

export class DayGroupEdit extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      show: 'none',
      name: '',
      daysIncluded: []
    };
  }
  constructDayGroup(): DayGroup {
    const {
      name, daysIncluded
    } = this.state;
    return {
      name: name,
      days: daysIncludedToDays(daysIncluded)
    };
  }
  openDayGroup(dayGroup?: DayGroup) {
    if (dayGroup != null) {
      this.setState({
        show: 'edit',
        name: dayGroup.name,
        daysIncluded: daysToDaysIncluded(dayGroup.days)
      });
    } else {
      this.setState({
        show: 'create',
        name: '',
        daysIncluded: []
      });
    }
  }
  async editDayGroup() {
    const dayGroup = this.constructDayGroup();
    if (await this.props.onEditDayGroup(dayGroup)) {
      this.setState({ show: 'none' });
    }
  }
  async createDayGroup() {
    const dayGroup = this.constructDayGroup();
    if (await this.props.onCreateDayGroup(dayGroup)) {
      this.setState({ show: 'none' });
    }
  }
  render() {
    const {
      show, name, daysIncluded
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
        <DialogTitle>{show === 'edit' ? 'Edit' : 'Create'} Day Grouping</DialogTitle>
        <FormControlLabel
          label="Name"
          labelPlacement="top"
          control={<Input value={name} onChange={(e) => {
            this.setState({
              name: e.target.value
            });
          }} type="text" name="name" />} />
        <SimpleDataTable
          colSpecs={[
            {
              attrName: 'name',
              type: 'select',
              dispName: 'Day Name',
              defaultValue: '',
              options: (() => {
                let hasBlank = false;
                const days = daySelectors.map(x => {
                  if (x.name === '') hasBlank = true;
                  return { valueName: x.name, dispName: x.name }
                });
                if (!hasBlank) {
                  days.unshift({
                    valueName: '', dispName: ''
                  });
                }
                return days;
              })()
            }
          ]}
          keyName="day-group-edit1"
          onRowsChanged={(prevRows: DaysIncludedRow[], newRows: DaysIncludedRow[]) => this.setState({ daysIncluded: newRows })}
          rows={daysIncluded}
        />
        {
          show === 'edit' ? (
            <Grid>
              <IconButton hidden={show !== 'edit'} style={{ color: 'green' }} onClick={() => this.editDayGroup()}>
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
              onClick={() => this.createDayGroup()}
            >Add</Button>
          ) : ''
        }
      </Dialog>
    );
  }
}
