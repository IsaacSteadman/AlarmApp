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

interface KeyValueRow extends RowType {
  key: string;
  value: string;
}

function isKeyValueRowsValid(rows: KeyValueRow[]): boolean {
  const obj: { [key: string]: number } = {};
  for (let i = 0; i < rows.length; ++i) {
    const { key } = rows[i];
    if (obj[key] != null) return false
    obj[key] = 1;
  }
  return true;
}

function keyValueRowsToObj(rows: KeyValueRow[]): { [key: string]: string } {
  const obj: { [key: string]: string } = {};
  for (let i = 0; i < rows.length; ++i) {
    const { key, value } = rows[i];
    obj[key] = value;
  }
  return obj;
}

function objToKeyValueRows(obj: { [key: string]: string }): KeyValueRow[] {
  const arr: KeyValueRow[] = [];
  for (const k in obj) {
    arr.push({
      editing: null,
      hasBeenCompletedOnce: true,
      key: k,
      value: obj[k]
    });
  }
  return arr;
}

interface SubActionRow extends RowType {
  actionName: string;
  duration: number;
}

function subActionRowsToCompositeSubActions(rows: SubActionRow[]): CompositeSubActionType[] {
  return rows.map(row => ({
    action: { name: row.actionName },
    duration: row.duration
  }));
}

function compositeSubActionsTosubActionRows(rows: CompositeSubActionType[]): SubActionRow[] {
  return rows.map(row => ({
    editing: null,
    hasBeenCompletedOnce: true,
    actionName: row.action.name,
    duration: row.duration
  }));
}

export interface CommonProps {
}

export interface Props extends CommonProps {
  actions: Action[];
  onCreateAction: (action: Action) => Promise<boolean> | boolean; // return true to confirm close
  onEditAction: (action: Action) => Promise<boolean> | boolean;
}

export interface State extends CommonProps {
  show: 'none' | 'edit' | 'create';
  name: string;
  description: string;
  dialogType: ActionType;
  gpioPin: number;
  gpioValue: boolean;
  spiBus: number;
  spiCs: number;
  spiDataValid: boolean;
  spiData: string;
  httpUrl: string;
  httpBodyType: 'string' | 'binary';
  httpBodyString: string;
  httpBodyStringValid: boolean;
  httpBodyBinary: string;
  httpBodyBinaryValid: boolean;
  httpMethod: HttpMethod;
  httpHeaders: KeyValueRow[];
  httpHeadersValid: boolean;
  httpCredentials: KeyValueRow[];
  httpCredentialsValid: boolean;
  fileFilename: string;
  fileDataToWriteType: 'string' | 'binary';
  fileDataToWriteString: string;
  fileDataToWriteStringValid: boolean;
  fileDataToWriteBinary: string;
  fileDataToWriteBinaryValid: boolean;
  fileAction: FileActionType;
  fileOffset: number;
  fileWhence: FileWhence;
  compositeSubActions: SubActionRow[];
}

export class ActionEdit extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      show: 'none',
      name: '',
      description: '',
      dialogType: 'gpio-set',
      gpioPin: 0,
      gpioValue: true,
      spiBus: 0,
      spiCs: 0,
      spiData: '',
      spiDataValid: true,
      httpUrl: '',
      httpBodyType: 'string',
      httpBodyString: '',
      httpBodyStringValid: true,
      httpBodyBinary: '',
      httpBodyBinaryValid: true,
      httpMethod: 'PUT',
      httpHeaders: [],
      httpHeadersValid: true,
      httpCredentials: [],
      httpCredentialsValid: true,
      fileFilename: '',
      fileDataToWriteType: 'string',
      fileDataToWriteString: '',
      fileDataToWriteStringValid: true,
      fileDataToWriteBinary: '',
      fileDataToWriteBinaryValid: true,
      fileAction: 'clear',
      fileOffset: 0,
      fileWhence: 'start',
      compositeSubActions: []
    };
  }
  constructAction(): Action {
    const {
      name, description, dialogType,
      gpioPin, gpioValue,
      spiBus, spiCs, spiData,
      httpUrl, httpBodyType, httpBodyString, httpBodyBinary, httpMethod,
      httpHeaders, httpCredentials,
      fileFilename, fileDataToWriteType, fileDataToWriteString,
      fileDataToWriteBinary, fileAction, fileOffset, fileWhence,
      compositeSubActions
    } = this.state;
    if (dialogType === 'gpio-set') {
      return {
        name, description,
        type: 'gpio-set',
        pin: gpioPin,
        value: gpioValue
      };
    } else if (dialogType === 'spi-write') {
      return {
        name, description,
        type: 'spi-write',
        bus: spiBus,
        cs: spiCs,
        data: hexStringToUint8Array(spiData)
      };
    } else if (dialogType === 'http') {
      return {
        name, description,
        type: 'http',
        url: httpUrl,
        body: httpBodyType === 'string' ? httpBodyString : hexStringToUint8Array(httpBodyBinary),
        method: httpMethod,
        headers: keyValueRowsToObj(httpHeaders),
        credentials: keyValueRowsToObj(httpCredentials)
      };
    } else if (dialogType === 'file') {
      return {
        name, description,
        type: 'file',
        filename: fileFilename,
        dataToWrite: fileDataToWriteType === 'string' ? fileDataToWriteString : hexStringToUint8Array(fileDataToWriteBinary),
        action: fileAction,
        offset: fileOffset,
        whence: fileWhence
      };
    } else if (dialogType === 'composite') {
      return {
        name, description,
        type: 'composite',
        subActions: subActionRowsToCompositeSubActions(compositeSubActions)
      };
    }
  }
  openAction(action?: Action) {
    this.setState({
      name: '',
      description: '',
      dialogType: 'gpio-set',
      gpioPin: 0,
      gpioValue: true,
      spiBus: 0,
      spiCs: 0,
      spiDataValid: true,
      spiData: '',
      httpUrl: '',
      httpBodyType: 'string',
      httpBodyString: '',
      httpBodyStringValid: true,
      httpBodyBinary: '',
      httpBodyBinaryValid: true,
      httpMethod: 'PUT',
      httpHeaders: [],
      httpHeadersValid: true,
      httpCredentials: [],
      httpCredentialsValid: true,
      fileFilename: '',
      fileDataToWriteType: 'string',
      fileDataToWriteString: '',
      fileDataToWriteStringValid: true,
      fileDataToWriteBinary: '',
      fileDataToWriteBinaryValid: true,
      fileAction: 'clear',
      fileOffset: 0,
      fileWhence: 'start',
      compositeSubActions: []
    });
    if (action == null) {
      this.openActionInternal({
        name: '',
        description: '',
        type: 'gpio-set',
        pin: 0,
        value: true
      });
      this.setState({
        show: 'create'
      });
    } else {
      this.openActionInternal(action);
      this.setState({
        show: 'edit'
      });
    }
  }
  openActionInternal(action: Action) {
    this.setState({
      name: action.name,
      description: action.description,
      dialogType: action.type
    });
    if (action.type === 'gpio-set') {
      this.setState({
        gpioPin: action.pin,
        gpioValue: action.value
      });
    } else if (action.type === 'spi-write') {
      this.setState({
        spiBus: action.bus,
        spiCs: action.cs,
        spiDataValid: true,
        spiData: uint8ArrayToHexString(action.data)
      });
    } else if (action.type === 'http') {
      this.setState({
        httpUrl: action.url,
        httpMethod: action.method,
        httpHeaders: objToKeyValueRows(action.headers),
        httpHeadersValid: true,
        httpCredentials: objToKeyValueRows(action.credentials),
        httpCredentialsValid: true
      });
      if (typeof action.body === 'string') {
        this.setState({
          httpBodyType: 'string',
          httpBodyString: action.body,
          httpBodyStringValid: true
        });
      } else {
        this.setState({
          httpBodyType: 'binary',
          httpBodyBinary: uint8ArrayToHexString(action.body),
          httpBodyBinaryValid: true
        });
      }
    } else if (action.type === 'file') {
      this.setState({
        fileFilename: action.filename,
        fileAction: action.action,
        fileOffset: action.offset,
        fileWhence: action.whence
      });
      if (typeof action.dataToWrite === 'string') {
        this.setState({
          fileDataToWriteType: 'string',
          fileDataToWriteString: action.dataToWrite,
          fileDataToWriteStringValid: true,
        })
      } else {
        this.setState({
          fileDataToWriteType: 'binary',
          fileDataToWriteBinary: uint8ArrayToHexString(action.dataToWrite),
          fileDataToWriteBinaryValid: true
        })
      }
    } else if (action.type === 'composite') {
      this.setState({
        compositeSubActions: compositeSubActionsTosubActionRows(action.subActions)
      });
    }
  }
  async editAction() {
    const action = this.constructAction();
    if (await this.props.onEditAction(action)) {
      this.setState({ show: 'none' });
    }
  }
  async createAction() {
    const action = this.constructAction();
    if (await this.props.onCreateAction(action)) {
      this.setState({ show: 'none' });
    }
  }
  render() {
    const {
      show, name, description, dialogType,
      gpioPin, gpioValue,
      spiBus, spiCs, spiData, spiDataValid,
      httpBodyBinary, httpBodyBinaryValid, httpBodyString, httpBodyStringValid,
      httpBodyType, httpCredentials, httpCredentialsValid, httpHeaders,
      httpHeadersValid, httpMethod, httpUrl,
      fileAction, fileDataToWriteBinary, fileDataToWriteBinaryValid,
      fileDataToWriteString, fileDataToWriteStringValid, fileDataToWriteType,
      fileFilename, fileOffset, fileWhence,
      compositeSubActions,
    } = this.state;
    const validStyle = {};
    const invalidStyle = {
      border: 'solid 1px red'
    };
    const disableSubmit = (
      (dialogType === 'spi-write' && !spiDataValid)
      || (dialogType === 'http' && httpBodyType === 'binary' && !httpBodyBinaryValid)
      || (dialogType === 'http' && httpBodyType === 'string' && !httpBodyStringValid)
      || (dialogType === 'file' && fileDataToWriteType === 'binary' && !fileDataToWriteBinaryValid)
      || (dialogType === 'file' && fileDataToWriteType === 'string' && !fileDataToWriteStringValid)
    );
    const { actions } = this.props;
    return (
      <Dialog
        open={show !== 'none'}
        onClose={() => this.setState({ show: 'none' })}
        fullWidth={true}
        maxWidth="xs"
      >
        <DialogTitle>Create Action</DialogTitle>
        <FormControlLabel
          label="Name"
          labelPlacement="top"
          control={<Input value={name} onChange={(e) => {
            this.setState({
              name: e.target.value
            });
          }} type="text" name="name" />} />
        <FormControlLabel
          label="Description"
          labelPlacement="top"
          control={<TextareaAutosize value={description} onChange={(e) => {
            this.setState({
              description: e.target.value
            });
          }} name="description" />} />
        <FormControlLabel
          label="Action Type"
          labelPlacement="top"
          control={
            <Select value={dialogType} onChange={(e) => {
              this.setState({
                dialogType: e.target.value as ActionType
              });
            }} name="dialogType">
              <option value="gpio-set">GPIO Set Pin Action</option>
              <option value="spi-write">SPI Write Action</option>
              <option value="http">HTTP Request Action</option>
              <option value="file">File Write Action</option>
              <option value="composite">List of Other Action</option>
            </Select>
          }
        />
        {
          dialogType === 'gpio-set' ? (
            <>
              <FormControlLabel
                label="GPIO Pin"
                labelPlacement="top"
                control={<Input value={gpioPin} onChange={(e) => {
                  this.setState({
                    gpioPin: +e.target.value
                  });
                }} type="number" name="gpioPin" />}
              />
              <FormControlLabel
                label="GPIO Value"
                labelPlacement="top"
                control={
                  <Select value={gpioValue ? '1' : '0'} onChange={(e) => {
                    this.setState({
                      gpioValue: !!+e.target.value
                    });
                  }} name="gpioValue">
                    <option value="0">Off</option>
                    <option value="1">On</option>
                  </Select>
                }
              />
            </>
          ) : ''
        }
        {
          dialogType === 'spi-write' ? (
            <>
              <FormControlLabel
                label="Action"
                labelPlacement="top"
                control={<Input value={spiBus} onChange={(e) => {
                  this.setState({
                    spiBus: +e.target.value
                  });
                }} type="number" name="spiBus" />}
              />
              <FormControlLabel
                label="Action"
                labelPlacement="top"
                control={<Input value={spiCs} onChange={(e) => {
                  this.setState({
                    spiCs: +e.target.value
                  });
                }} type="number" name="spiCs" />}
              />
              <FormControlLabel
                label="Action"
                labelPlacement="top"
                control={
                  <Input
                    value={spiData}
                    onChange={(e) => {
                      this.setState({
                        spiData: e.target.value,
                        spiDataValid: /^([0-9a-fA-F]{2})+$/.test(e.target.value)
                      });
                    }}
                    type="text"
                    name="spiData"
                    style={spiDataValid ? validStyle : invalidStyle}
                  />
                }
              />
            </>
          ) : ''
        }
        {
          dialogType === 'http' ? (
            <>
              <FormControlLabel
                label="HTTP URL"
                labelPlacement="top"
                control={<Input value={httpUrl} onChange={(e) => {
                  this.setState({
                    httpUrl: e.target.value
                  });
                }} type="text" name="httpUrl" />}
              />
              <FormControlLabel
                label="HTTP Method"
                labelPlacement="top"
                control={
                  <Select
                    value={httpMethod}
                    onChange={(e) => {
                      this.setState({
                        httpMethod: e.target.value as HttpMethod
                      });
                    }}
                    name="httpMethod">
                    <option value="GET">GET</option>
                    <option value="PUT">PUT</option>
                    <option value="POST">POST</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </Select>
                }
              />
              <SimpleDataTable
                colSpecs={[
                  { attrName: 'key', defaultValue: '', dispName: 'Key', type: 'text' },
                  { attrName: 'value', defaultValue: '', dispName: 'Value', type: 'text' }
                ]}
                rows={httpHeaders}
                style={httpHeadersValid ? validStyle : invalidStyle}
                onRowsChanged={
                  (prevRows: KeyValueRow[], newRows: KeyValueRow[]) => (
                    this.setState({
                      httpHeaders: newRows,
                      httpHeadersValid: isKeyValueRowsValid(newRows)
                    })
                  )
                }
              />
              <SimpleDataTable
                colSpecs={[
                  { attrName: 'key', defaultValue: '', dispName: 'Key', type: 'text' },
                  { attrName: 'value', defaultValue: '', dispName: 'Value', type: 'text' }
                ]}
                rows={httpCredentials}
                style={httpCredentialsValid ? validStyle : invalidStyle}
                onRowsChanged={
                  (prevRows: KeyValueRow[], newRows: KeyValueRow[]) => (
                    this.setState({
                      httpCredentials: newRows,
                      httpCredentialsValid: isKeyValueRowsValid(newRows)
                    })
                  )
                }
              />
              <FormControlLabel
                label="Request Body Format"
                labelPlacement="top"
                control={
                  <Select
                    name="httpBodyType"
                    value={httpBodyType}
                    onChange={e => this.setState({ httpBodyType: e.target.value as ('string' | 'binary') })}
                  >
                    <option value="string">String (provided as normal text)</option>
                    <option value="binary">Binary (provided as hexadecimal)</option>
                  </Select>
                }
              />
              {
                httpBodyType === 'string' ? (
                  <FormControlLabel
                    label="Request Body"
                    labelPlacement="top"
                    control={
                      <TextareaAutosize
                        name="httpBodyString"
                        value={httpBodyString}
                        onChange={e => this.setState({
                          httpBodyString: e.target.value,
                          httpBodyStringValid: true
                        })}
                      />
                    }
                  />
                ) : (
                    <FormControlLabel
                      label="Request Body"
                      labelPlacement="top"
                      control={
                        <TextareaAutosize
                          name="httpBodyBinary"
                          value={httpBodyBinary}
                          style={httpBodyBinaryValid ? validStyle : invalidStyle}
                          onChange={e => this.setState({
                            httpBodyBinary: e.target.value,
                            httpBodyBinaryValid: /^([0-9a-fA-F]{2})+$/.test(e.target.value)
                          })}
                        />
                      }
                    />
                  )
              }
            </>
          ) : ''
        }
        {
          dialogType === 'file' ? (
            <>
              <FormControlLabel
                label="Filename"
                labelPlacement="top"
                control={
                  <Input
                    type="text"
                    name="fileFilename"
                    value={fileFilename}
                    onChange={e => this.setState({ fileFilename: e.target.value })}
                  />
                }
              />
              <FormControlLabel
                label="Format Of Data To Write"
                labelPlacement="top"
                control={
                  <Select
                    name="fileDataToWriteType"
                    value={fileDataToWriteType}
                    onChange={e => this.setState({ fileDataToWriteType: e.target.value as ('string' | 'binary') })}
                  >
                    <option value="string">String (provided as normal text)</option>
                    <option value="binary">Binary (provided as hexadecimal)</option>
                  </Select>
                }
              />
              {
                httpBodyType === 'string' ? (
                  <FormControlLabel
                    label="File Data To Write"
                    labelPlacement="top"
                    control={
                      <TextareaAutosize
                        name="fileDataToWriteString"
                        value={fileDataToWriteString}
                        onChange={e => this.setState({
                          fileDataToWriteString: e.target.value,
                          fileDataToWriteStringValid: true
                        })}
                      />
                    }
                  />
                ) : (
                    <FormControlLabel
                      label="File Data To Write"
                      labelPlacement="top"
                      control={
                        <TextareaAutosize
                          name="fileDataToWriteBinary"
                          value={fileDataToWriteBinary}
                          style={fileDataToWriteBinaryValid ? validStyle : invalidStyle}
                          onChange={e => this.setState({
                            fileDataToWriteBinary: e.target.value,
                            fileDataToWriteBinaryValid: /^([0-9a-fA-F]{2})+$/.test(e.target.value)
                          })}
                        />
                      }
                    />
                  )
              }
              <FormControlLabel
                label="File Action"
                labelPlacement="top"
                control={
                  <Select
                    name="fileAction"
                    value={fileAction}
                    onChange={e => this.setState({ fileAction: e.target.value as FileActionType })}
                  >
                    <option value="clear">Clear (file is cleared before writing)</option>
                    <option value="reuse">End (file is not cleared before writing)</option>
                  </Select>
                }
              />
              <FormControlLabel
                label="File Offset To Write At"
                labelPlacement="top"
                control={
                  <Input
                    type="text"
                    name="fileOffset"
                    value={fileOffset}
                    inputProps={{ step: 1 }}
                    onChange={e => this.setState({ fileOffset: +e.target.value })}
                  />
                }
              />
              <FormControlLabel
                label="File Offset From Where"
                labelPlacement="top"
                control={
                  <Select
                    name="fileWhence"
                    value={fileWhence}
                    onChange={e => this.setState({ fileWhence: e.target.value as FileWhence })}
                  >
                    <option value="start">Start (beginning of file is 0)</option>
                    <option value="end">End (end of file is 0)</option>
                  </Select>
                }
              />
            </>
          ) : ''
        }
        {
          dialogType === 'composite' ? (
            <SimpleDataTable
              colSpecs={[
                {
                  attrName: 'actionName',
                  defaultValue: actions.length ? actions[0].name : '',
                  dispName: 'Action Name',
                  type: 'select',
                  options: actions.map(action => ({ dispName: action.name, valueName: action.name }))
                },
                {
                  attrName: 'duration',
                  dispName: 'Duration (milliseconds)',
                  type: 'number',
                  defaultValue: 3600000,
                  min: 0,
                  step: 1,
                  max: null
                }
              ]}
              rows={compositeSubActions}
              onRowsChanged={
                (prevRows: SubActionRow[], newRows: SubActionRow[]) => this.setState({ compositeSubActions: newRows })
              }
            />
          ) : ''
        }
        {
          show === 'edit' ? (
            <Grid>
              <IconButton disabled={disableSubmit} hidden={show !== 'edit'} style={{ color: 'green' }} onClick={() => this.editAction()}>
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
              disabled={disableSubmit}
              hidden={show !== 'create'}
              variant="contained"
              color="primary"
              onClick={() => this.createAction()}
            >Add</Button>
          ) : ''
        }
      </Dialog>);
  }
}
