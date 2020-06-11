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
import { Action } from '../../common/models/Action';
import { ActionEdit } from './ActionEdit';

export interface CommonProps {
}

export interface Props extends CommonProps {
  actions: Action[];
  onCreateAction: (action: Action) => Promise<boolean> | boolean; // return true to confirm close
  onEditAction: (action: Action) => Promise<boolean> | boolean;
}

export interface State extends CommonProps {
}

export class Actions extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }
  render() {
    const { actions, onCreateAction, onEditAction } = this.props;
    let actionEdit: ActionEdit;
    return (
      <TableContainer>
        <Table className="actionTable">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Action to Perfom</TableCell>
              <TableCell colSpan={2}>Edit Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              actions.map(action => (
                <TableRow key={`actions-row-${action.name}`}>
                  <TableCell>{action.name}</TableCell>
                  <TableCell>{action.description}</TableCell>
                  {(() => {
                    if (action.type === 'composite') {
                      return (
                        <>
                          <TableCell>Composite</TableCell>
                          <TableCell>{action.subActions.map(subAction => {
                            return `${subAction.duration / 1e3} seconds of ${subAction.action.name}`;
                          }).join(', ')}</TableCell>
                        </>
                      );
                    } else if (action.type === 'file') {
                      return (
                        <>
                          <TableCell>File Write</TableCell>
                          <TableCell>{`writes ${action.dataToWrite} to file <${action.filename}> at ${action.offset} from ${action.whence === 'end' ? 'end' : 'start'}`}</TableCell>
                        </>
                      );
                    } else if (action.type === 'gpio-set') {
                      return (
                        <>
                          <TableCell>Set GPIO</TableCell>
                          <TableCell>{`sets pin ${action.pin} to ${action.value}`}</TableCell>
                        </>
                      );
                    } else if (action.type === 'http') {
                      return (
                        <>
                          <TableCell>HTTP Request</TableCell>
                          <TableCell>{`sends http ${action.method} request to ${action.url} with headers ${JSON.stringify(action.headers)} and credentials ${JSON.stringify(action.credentials)}`}</TableCell>
                        </>
                      );
                    } else if (action.type === 'spi-write') {
                      return (
                        <>
                          <TableCell>SPI Bus Write</TableCell>
                          <TableCell>{`writes ${action.data} to spi (bus=${action.bus},cs=${action.cs})`}</TableCell>
                        </>
                      );
                    }
                  })()}
                  <TableCell>
                    <IconButton style={{ color: 'black' }} onClick={() => actionEdit.openAction(action)}>
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
        <ActionEdit
          actions={actions}
          ref={e => actionEdit = e}
          onCreateAction={onCreateAction}
          onEditAction={onEditAction}
        />
        <Fab color="primary" style={{ ...bottomRightFabStyle }} onClick={() => actionEdit.openAction(null)}>
          <AddIcon />
        </Fab>
      </TableContainer>
    )
  }
}
