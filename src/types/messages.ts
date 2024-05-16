import {
  AccessRightsAuxiliaryData,
  AccessRightsChat,
  AuthResult,
  CertificateDescription,
  CertificateValidity,
  FailureCodes,
  InfoAusweisApp,
  ReaderData,
  VersionInfo,
  Workflow,
} from './auxiliary_types';

export enum AA2Messages {
  AccessRights = 'ACCESS_RIGHTS',
  Auth = 'AUTH',
  Certificate = 'CERTIFICATE',
  ChangePin = 'CHANGE_PIN',
  EnterPin = 'ENTER_PIN',
  EnterNewPin = 'ENTER_NEW_PIN',
  EnterPuk = 'ENTER_PUK',
  EnterCan = 'ENTER_CAN',
  InsertCard = 'INSERT_CARD',
  BadState = 'BAD_STATE',
  Reader = 'READER',
  Invalid = 'INVALID',
  UnknownCommand = 'UNKNOWN_COMMAND',
  InternalError = 'INTERNAL_ERROR',
  Status = 'STATUS',
  Info = 'INFO',
  ReaderList = 'READER_LIST',
  ApiLevel = 'API_LEVEL',
}

/**
 * https://www.ausweisapp.bund.de/sdk/messages.html#access-rights
 */
export type AccessRights = {
  msg: AA2Messages.AccessRights;
  error?: string;
  aux?: AccessRightsAuxiliaryData;
  chat: AccessRightsChat;
  transactionInfo?: string;
};

/**
 * https://www.ausweisapp.bund.de/sdk/messages.html#api-level
 */
export type ApiLevel = {
  msg: AA2Messages.ApiLevel;
  error?: string;
  available?: number[];
  current: number;
};

/**
 * https://www.ausweisapp.bund.de/sdk/messages.html#auth
 */
export type Auth = {
  msg: AA2Messages.Auth;
  error?: string;
  url?: string;
  result?: AuthResult;
};

/**
 * https://www.ausweisapp.bund.de/sdk/messages.html#bad-state
 */
export type BadState = {
  msg: AA2Messages.BadState;
  error: string;
};

/**
 * https://www.ausweisapp.bund.de/sdk/messages.html#certificate
 */
export type Certificate = {
  msg: AA2Messages.Certificate;
  description: CertificateDescription;
  validity: CertificateValidity;
};

/**
 * https://www.ausweisapp.bund.de/sdk/messages.html#change-pin
 */
export type ChangePin = {
  msg: AA2Messages.ChangePin;
  success?: boolean;
  reason?: FailureCodes;
};

/**
 * https://www.ausweisapp.bund.de/sdk/messages.html#enter-can
 */
export type EnterCan = {
  msg: AA2Messages.EnterCan;
  error?: string;
  reader?: ReaderData;
};

/**
 * https://www.ausweisapp.bund.de/sdk/messages.html#enter-pin
 */
export type EnterPin = {
  msg: AA2Messages.EnterPin;
  error?: string;
  reader?: ReaderData;
};

/**
 * https://www.ausweisapp.bund.de/sdk/messages.html#enter-new-pin
 */
export type EnterNewPin = {
  msg: AA2Messages.EnterNewPin;
  error?: string;
  reader?: ReaderData;
};

/**
 * https://www.ausweisapp.bund.de/sdk/messages.html#enter-puk
 */
export type EnterPuk = {
  msg: AA2Messages.EnterPuk;
  error?: string;
  reader?: ReaderData;
};

/**
 * https://www.ausweisapp.bund.de/sdk/messages.html#info
 */
export type Info = {
  msg: AA2Messages.Info;
  VersionInfo: VersionInfo;
  AusweisApp?: InfoAusweisApp;
};

/**
 * https://www.ausweisapp.bund.de/sdk/messages.html#insert-card
 */
export type InsertCard = {
  msg: AA2Messages.InsertCard;
  error?: string;
};

/**
 * https://www.ausweisapp.bund.de/sdk/messages.html#internal-error
 */
export type InternalError = {
  msg: AA2Messages.InternalError;
  error: string;
};

/**
 * https://www.ausweisapp.bund.de/sdk/messages.html#invalid
 */
export type Invalid = {
  msg: AA2Messages.Invalid;
  error: string;
};

/**
 * https://www.ausweisapp.bund.de/sdk/messages.html#reader
 */
export type Reader = {
  msg: AA2Messages.Reader;
} & ReaderData;

/**
 * https://www.ausweisapp.bund.de/sdk/messages.html#reader-list
 */
export type ReaderList = {
  msg: AA2Messages.ReaderList;
  readers: ReaderData[];
};

/**
 * https://www.ausweisapp.bund.de/sdk/messages.html#status
 */
export type Status = {
  msg: AA2Messages.Status;
  workflow: Workflow | null;
  progress: number | null;
  state: AA2Messages | null;
};

/**
 * https://www.ausweisapp.bund.de/sdk/messages.html#unknown-command
 */
export type UnknownCommand = {
  msg: AA2Messages.UnknownCommand;
  error: string;
};

export type Messages =
  | AccessRights
  | Auth
  | Certificate
  | ChangePin
  | EnterPin
  | EnterNewPin
  | EnterPuk
  | EnterCan
  | InsertCard
  | BadState
  | Reader
  | Invalid
  | UnknownCommand
  | InternalError
  | Status
  | Info
  | ReaderList
  | ApiLevel;

export type Message<A extends AA2Messages> = { msg: A } & Messages;
