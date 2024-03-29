import * as React from 'react';
import { render } from 'react-dom';

import { Toolbar, AppBar, Button, Table, TableContainer, TableHead, TableCell, TableBody, TableRow, Input, Fab, Container, Dialog, DialogTitle, makeStyles, IconButton, FormControlLabel, Checkbox, Select } from '@material-ui/core';
import { KeyboardTimePicker } from '@material-ui/pickers';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';

export interface CommonProps {
}

export type RowType = { editing: null | { [key: string]: any }, hasBeenCompletedOnce: boolean, [key: string]: any };

interface BaseColSpec {
  attrName: string; // property name in object
  dispName: string; // name to display in the header
  type: string;
  defaultValue: any;
}
export interface NumberColSpec extends BaseColSpec {
  type: 'number';
  defaultValue: number;
  min: number;
  max: number;
  step: number;
}
export interface TextColSpec extends BaseColSpec {
  type: 'text';
  defaultValue: string;
}
export interface OptionSpec {
  valueName: string;
  dispName: string;
}
export interface SelectColSpec extends BaseColSpec {
  type: 'select';
  defaultValue: string;
  options: OptionSpec[];
}
export type ColSpec = NumberColSpec | TextColSpec | SelectColSpec;

function alterEditingState(rows: RowType[], row: number, attrName: string, newValue: any): RowType[] {
  const obj = { ...rows[row], editing: { ...rows[row].editing } };
  obj.editing[attrName] = newValue;
  console.log('newObj =', obj);
  return rows.slice(0, row).concat([obj]).concat(rows.slice(row + 1));
}

function alterStateSetEditing(rows: RowType[], row: number): RowType[] {
  const editing = { ...rows[row] };
  delete editing.editing;
  delete editing.hasBeenCompletedOnce;
  const obj = { ...rows[row], editing };
  return rows.slice(0, row).concat([obj]).concat(rows.slice(row + 1));
}

function alterStateCancelEditing(rows: RowType[], row: number): RowType[] {
  if (!rows[row].hasBeenCompletedOnce) {
    return alterStateDeleteRow(rows, row);
  }
  const obj = { ...rows[row] };
  obj.editing = null;
  return rows.slice(0, row).concat([obj]).concat(rows.slice(row + 1));
}

function alterStateSaveEditing(rows: RowType[], row: number): RowType[] {
  const obj: RowType = { ...rows[row].editing, hasBeenCompletedOnce: true, editing: null };
  return rows.slice(0, row).concat([obj]).concat(rows.slice(row + 1));
}

function alterStateAddRow(rows: RowType[], colSpec: ColSpec[]): RowType[] {
  const newRow: RowType = { editing: null, hasBeenCompletedOnce: false };
  colSpec.forEach(spec => {
    newRow[spec.attrName] = spec.defaultValue;
  });
  newRow.editing = { ...newRow };
  delete newRow.editing.editing;
  delete newRow.editing.hasBeenCompletedOnce;
  return rows.concat([newRow]);
}

function alterStateDeleteRow(rows: RowType[], row: number): RowType[] {
  return rows.slice(0, row).concat(rows.slice(row + 1));
}

export interface Props extends CommonProps {
  colSpecs: ColSpec[];
  rows: RowType[];
  onRowsChanged: (prevRows: RowType[], newRows: RowType[]) => any;
  keyName: string;
}

export interface State extends CommonProps {
}

export class SimpleDataTable extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    const { keyName, colSpecs, rows, onRowsChanged } = this.props;
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {
                (() => colSpecs.map(spec => (
                  <TableCell key={`simple-table-${keyName}-header-col-${spec.attrName}`}>{spec.dispName}</TableCell>
                ))
                )()
              }
              <TableCell colSpan={2}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              rows.map((row, rowIdx) => (
                row.editing == null ? (
                  <TableRow key={`simple-table-${keyName}-row-${rowIdx}`}>
                    {
                      colSpecs.map((spec, colIdx) => (
                        <TableCell key={`simple-table-${keyName}-row-${rowIdx}-col${colIdx}`}>{row[spec.attrName]}</TableCell>
                      ))
                    }
                    <TableCell>
                      <IconButton style={{ color: 'black' }} onClick={() => onRowsChanged(rows, alterStateSetEditing(rows, rowIdx))}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <IconButton style={{ color: 'red' }} onClick={() => onRowsChanged(rows, alterStateDeleteRow(rows, rowIdx))}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ) : (
                    <TableRow key={`simple-table-${keyName}-row-${rowIdx}`}>
                      {
                        colSpecs.map((spec, colIdx) => {
                          if (spec.type === 'number') {
                            const objMinMaxStep: { min?: number, max?: number, step?: number } = {};
                            if (spec.min != null) {
                              objMinMaxStep.min = spec.min;
                            }
                            if (spec.max != null) {
                              objMinMaxStep.max = spec.max;
                            }
                            if (spec.step != null) {
                              objMinMaxStep.step = spec.step;
                            }
                            return (
                              <TableCell key={`simple-table-${keyName}-row-${rowIdx}-col${colIdx}`}>
                                <Input
                                  value={row.editing[spec.attrName]}
                                  onChange={(e) => onRowsChanged(rows, alterEditingState(rows, rowIdx, spec.attrName, +e.target.value))}
                                  inputProps={objMinMaxStep}
                                />
                              </TableCell>
                            );
                          } else if (spec.type === 'text') {
                            return (
                              <TableCell key={`simple-table-${keyName}-row-${rowIdx}-col${colIdx}`}>
                                <Input
                                  value={row.editing[spec.attrName]}
                                  onChange={(e) => onRowsChanged(rows, alterEditingState(rows, rowIdx, spec.attrName, e.target.value))}
                                />
                              </TableCell>
                            );
                          } else if (spec.type === 'select') {
                            console.log('editing =', row.editing);
                            console.log('spec.attrName =', spec.attrName)
                            console.log('select value=' + row.editing[spec.attrName]);
                            return (
                              <TableCell key={`simple-table-${keyName}-row-${rowIdx}-col${colIdx}`}>
                                <Select
                                  value={row.editing[spec.attrName]}
                                  onChange={
                                    (e) => {
                                      const newRows = alterEditingState(rows, rowIdx, spec.attrName, e.target.value);
                                      onRowsChanged(rows, newRows);
                                    }}
                                >
                                  {
                                    spec.options.map((option, optIdx) => {
                                      console.log('option =', option);
                                      return (
                                        <option key={`simple-table-${keyName}-row-${rowIdx}-col${colIdx}-opt-${optIdx}`} value={option.valueName}>{option.dispName}</option>
                                      );
                                    })
                                  }
                                </Select>
                              </TableCell>
                            );
                          } else {
                            throw new TypeError('unreachable');
                          }
                        })
                      }
                      <TableCell>
                        <IconButton style={{ color: 'green' }} onClick={() => onRowsChanged(rows, alterStateSaveEditing(rows, rowIdx))}>
                          <DoneIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <IconButton style={{ color: 'red' }} onClick={() => onRowsChanged(rows, alterStateCancelEditing(rows, rowIdx))}>
                          <CloseIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
              ))
            }
            <TableRow>
              <TableCell colSpan={colSpecs.length}>
                [New Row]
              </TableCell>
              <TableCell colSpan={2}>
                <IconButton style={{ color: 'green' }} onClick={() => onRowsChanged(rows, alterStateAddRow(rows, colSpecs))}>
                  <AddIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    )
  }
}
