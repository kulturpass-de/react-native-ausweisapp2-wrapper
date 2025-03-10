import { AccessRight, Simulator, WorkflowMessages } from './auxiliary_types';

export enum AA2Commands {
  GetInfo = 'GET_INFO',
  GetStatus = 'GET_STATUS',
  GetApiLevel = 'GET_API_LEVEL',
  SetApiLevel = 'SET_API_LEVEL',
  GetReader = 'GET_READER',
  GetReaderList = 'GET_READER_LIST',
  RunAuth = 'RUN_AUTH',
  ChangePin = 'RUN_CHANGE_PIN',
  GetAccessRights = 'GET_ACCESS_RIGHTS',
  SetAccessRights = 'SET_ACCESS_RIGHTS',
  SetCard = 'SET_CARD',
  Continue = 'CONTINUE',
  GetCertificate = 'GET_CERTIFICATE',
  Cancel = 'CANCEL',
  Accept = 'ACCEPT',
  Interrupt = 'INTERRUPT',
  SetPin = 'SET_PIN',
  SetNewPin = 'SET_NEW_PIN',
  SetCan = 'SET_CAN',
  SetPuk = 'SET_PUK',
}

/**
 * https://www.ausweisapp.bund.de/sdk/commands.html#get-info
 */
export type GetInfo = {
  cmd: AA2Commands.GetInfo;
};

/**
 * https://www.ausweisapp.bund.de/sdk/commands.html#get-status
 */
export type GetStatus = {
  cmd: AA2Commands.GetStatus;
};

/**
 * https://www.ausweisapp.bund.de/sdk/commands.html#get-api-level
 */
export type GetApiLevel = {
  cmd: AA2Commands.GetApiLevel;
};

/**
 * https://www.ausweisapp.bund.de/sdk/commands.html#set-api-level
 */
export type SetApiLevel = {
  cmd: AA2Commands.SetApiLevel;
  level: number;
};

/**
 * https://www.ausweisapp.bund.de/sdk/commands.html#get-reader
 */
export type GetReader = {
  cmd: AA2Commands.GetReader;
  name: string;
};

/**
 * https://www.ausweisapp.bund.de/sdk/commands.html#get-reader-list
 */
export type GetReaderList = {
  cmd: AA2Commands.GetReaderList;
};

/**
 * https://www.ausweisapp.bund.de/sdk/commands.html#run-auth
 */
export type RunAuth = {
  cmd: AA2Commands.RunAuth;
  tcTokenURL: string;
  developerMode?: boolean;
  handleInterrupt?: boolean;
  status?: boolean;
  messages?: WorkflowMessages;
};

/**
 * https://www.ausweisapp.bund.de/sdk/commands.html#run-change-pin
 */
export type ChangePin = {
  cmd: AA2Commands.ChangePin;
  handleInterrupt?: boolean;
  status?: boolean;
  messages?: WorkflowMessages;
};

/**
 * https://www.ausweisapp.bund.de/sdk/commands.html#get-access-rights
 */
export type GetAccessRights = {
  cmd: AA2Commands.GetAccessRights;
};

/**
 * https://www.ausweisapp.bund.de/sdk/commands.html#set-access-rights
 */
export type SetAccessRights = {
  cmd: AA2Commands.SetAccessRights;
  chat: AccessRight[];
};

/**
 * https://www.ausweisapp.bund.de/sdk/commands.html#set-card
 */
export type SetCard = {
  cmd: AA2Commands.SetCard;
  name: string;
  simulator?: Simulator;
};

/**
 * https://www.ausweisapp.bund.de/sdk/commands.html#continue
 * (Only API Level 3 or higher)
 */
export type Continue = {
  cmd: AA2Commands.Continue;
};

/**
 * https://www.ausweisapp.bund.de/sdk/commands.html#get-certificate
 */
export type GetCertificate = {
  cmd: AA2Commands.GetCertificate;
};

/**
 * https://www.ausweisapp.bund.de/sdk/commands.html#cancel
 */
export type Cancel = {
  cmd: AA2Commands.Cancel;
};

/**
 * https://www.ausweisapp.bund.de/sdk/commands.html#accept
 */
export type Accept = {
  cmd: AA2Commands.Accept;
};

/**
 * https://www.ausweisapp.bund.de/sdk/commands.html#interrupt
 */
export type Interrupt = {
  cmd: AA2Commands.Interrupt;
};

/**
 * https://www.ausweisapp.bund.de/sdk/commands.html#set-pin
 */
export type SetPin = {
  cmd: AA2Commands.SetPin;
  value?: string;
};

/**
 * https://www.ausweisapp.bund.de/sdk/commands.html#set-new-pin
 */
export type SetNewPin = {
  cmd: AA2Commands.SetNewPin;
  value?: string;
};

/**
 * https://www.ausweisapp.bund.de/sdk/commands.html#set-can
 */
export type SetCan = {
  cmd: AA2Commands.SetCan;
  value?: string;
};

/**
 * https://www.ausweisapp.bund.de/sdk/commands.html#set-puk
 */
export type SetPuk = {
  cmd: AA2Commands.SetPuk;
  value?: string;
};

export type Commands =
  | GetInfo
  | GetStatus
  | GetApiLevel
  | SetApiLevel
  | GetReader
  | GetReaderList
  | RunAuth
  | ChangePin
  | GetAccessRights
  | SetAccessRights
  | SetCard
  | GetCertificate
  | Cancel
  | Accept
  | Interrupt
  | SetPin
  | SetNewPin
  | SetCan
  | SetPuk
  | Continue;

export type Command<A extends AA2Commands> = { cmd: A } & Commands;
