export interface BaseAction {
  name: string;
  description: string;
  type: string;
}

interface GpioEnablePinAction extends BaseAction {
  type: 'gpio-set';
  pin: number;
  value: boolean;
}

interface SpiWriteAction extends BaseAction {
  type: 'spi-write';
  bus: number;
  cs: number;
  data: Uint8Array;
}

export type HttpMethod = 'GET' | 'PUT' | 'POST' | 'DELETE' | 'PATCH';
export type HttpHeaders = { [key: string]: string };

// usually username and password
export type HttpCredentials = { [key: string]: string };

interface HttpRequestAction extends BaseAction {
  type: 'http';
  url: string;
  body: string | Uint8Array;
  method: HttpMethod;
  headers: HttpHeaders;
  credentials: HttpCredentials;
}

export type FileActionType = 'clear' | 'reuse';
export type FileWhence = 'start' | 'end';

interface FileIoAction extends BaseAction {
  type: 'file';
  filename: string;
  dataToWrite: string | Uint8Array;
  action: FileActionType;
  offset: number;
  whence: FileWhence;
}

export type CompositeSubActionType = {
  action: Action | { name: string },
  duration: number // duration is in milliseconds
};

interface CompositeAction extends BaseAction {
  type: 'composite';
  subActions: CompositeSubActionType[];
}

export type ActionType = 'gpio-set' | 'spi-write' | 'http' | 'file' | 'composite';

export type Action = GpioEnablePinAction | SpiWriteAction | HttpRequestAction | FileIoAction | CompositeAction;
