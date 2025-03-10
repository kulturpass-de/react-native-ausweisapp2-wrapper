import { firstValueFrom, merge, timeout } from 'rxjs';

import {
  AA2ConnectedObservable,
  AA2DisconnectedObservable,
} from './ausweisapp2-message-event-observables';
import { AusweisApp2SDKWrapper } from './ausweisapp2-sdk-wrapper';
import {
  InternalErrorObservable,
  throwAA2CardDeactivatedErrorOperator,
} from './error-handling';
import { logAA2Messages } from './logging';
import type { Simulator, WorkflowMessages } from './types/auxiliary_types';
import { AccessRight } from './types/auxiliary_types';
import { AA2Commands } from './types/commands';
import type {
  AccessRights,
  ApiLevel,
  Auth,
  Certificate,
  ChangePin,
  EnterCan,
  EnterNewPin,
  EnterPin,
  EnterPuk,
  Info,
  Reader,
  ReaderList,
  Status,
} from './types/messages';
import { AA2Messages } from './types/messages';
import {
  DEFAULT_TIMEOUT,
  sendCommand,
  sendCommandWithoutResult,
} from './utils';

/**
 * General command service options
 */
export type CommandServiceOptions = {
  // Timeout in milliseconds until the function promise needs to resolve with a response
  msTimeout?: number;
};

export const AA2CommandService = {
  /**
   * Start the AusweisApp SDK and start NFC on Android
   * @param {CommandServiceOptions} [options] General command service options
   */
  start: async (options?: CommandServiceOptions) => {
    if (await AusweisApp2SDKWrapper.isRunning()) {
      console.warn('AusweisApp SDK already started');
      return;
    }

    const observable = merge(
      AA2ConnectedObservable,
      InternalErrorObservable
    ).pipe(timeout({ first: options?.msTimeout ?? DEFAULT_TIMEOUT }));

    const connected = firstValueFrom(observable);
    AusweisApp2SDKWrapper.start();
    await connected;
  },
  /**
   * Stop the AusweisApp SDK and stop NFC on Android
   * @param {CommandServiceOptions} [options] General command service options
   */
  stop: async (options?: CommandServiceOptions) => {
    if (!(await AusweisApp2SDKWrapper.isRunning())) {
      console.warn('AusweisApp SDK already stopped');
      return;
    }

    const observable = merge(
      AA2DisconnectedObservable,
      InternalErrorObservable
    ).pipe(timeout({ first: options?.msTimeout ?? DEFAULT_TIMEOUT }));
    const disconnected = firstValueFrom(observable);
    AusweisApp2SDKWrapper.stop();
    await disconnected;
    logAA2Messages(false);
  },
  /**
   * Check if the AusweisApp SDK is already running
   */
  isRunning: (): Promise<boolean> => {
    return AusweisApp2SDKWrapper.isRunning();
  },
  /**
   * Returns information about the current installation of AusweisApp.
   * https://www.ausweisapp.bund.de/sdk/commands.html#get-info
   * @returns Message {@link Info}
   * @param {CommandServiceOptions} [options] General command service options
   */
  getInfo: (options?: CommandServiceOptions): Promise<Info> =>
    sendCommand(AA2Commands.GetInfo, [AA2Messages.Info], {}, options, true),
  /**
   * Returns information about the current workflow and state of AusweisApp.
   * https://www.ausweisapp.bund.de/sdk/commands.html#get-status
   * @param {CommandServiceOptions} [options] General command service options
   * @returns Message {@link Status}
   */
  getStatus: (options?: CommandServiceOptions): Promise<Status> =>
    sendCommand(AA2Commands.GetStatus, [AA2Messages.Status], {}, options, true),
  /**
   * Returns information about the available and current API level.
   * https://www.ausweisapp.bund.de/sdk/commands.html#get-api-level
   * @param {CommandServiceOptions} [options] General command service options
   * @returns Message {@link ApiLevel}
   */
  getApiLevel: (options?: CommandServiceOptions): Promise<ApiLevel> =>
    sendCommand(
      AA2Commands.GetApiLevel,
      [AA2Messages.ApiLevel],
      {},
      options,
      true
    ),
  /**
   * Set supported API level of your application.
   * https://www.ausweisapp.bund.de/sdk/commands.html#set-api-level
   * @param {number} level Supported API level of your app.
   * @param {CommandServiceOptions} [options] General command service options
   * @returns Message {@link ApiLevel}
   */
  setApiLevel: (
    level: number,
    options?: CommandServiceOptions
  ): Promise<ApiLevel> =>
    sendCommand(
      AA2Commands.SetApiLevel,
      [AA2Messages.ApiLevel],
      { level },
      options,
      true
    ),
  /**
   * Returns information about the requested reader.
   * https://www.ausweisapp.bund.de/sdk/commands.html#get-reader
   * @param {string} name Name of the reader.
   * @param {CommandServiceOptions} [options] General command service options
   * @returns Message {@link Reader}
   */
  getReader: (name: string, options?: CommandServiceOptions): Promise<Reader> =>
    sendCommand(
      AA2Commands.GetReader,
      [AA2Messages.Reader],
      { name },
      options,
      true
    ),
  /**
   * Returns information about all connected readers.
   * https://www.ausweisapp.bund.de/sdk/commands.html#get-reader-list
   * @param {CommandServiceOptions} [options] General command service options
   * @returns Message {@link ReaderList}
   */
  getReaderList: (options?: CommandServiceOptions): Promise<ReaderList> =>
    sendCommand(
      AA2Commands.GetReaderList,
      [AA2Messages.ReaderList],
      {},
      options,
      true
    ),
  /**
   * Starts an authentication.
   * https://www.ausweisapp.bund.de/sdk/commands.html#run-auth
   * @param {string} tcTokenURL URL to the TcToken. This is equal to the desktop style activation URL. (http://127.0.0.1:24727/eID-Client?tcTokenURL=)
   * @param {boolean} [developerMode=false] True to enable “Developer Mode” for test cards and disable some security checks according to BSI TR-03124-1, otherwise false.
   * @param {boolean} [handleInterrupt=false] True to automatically handle system dialog on iOS, otherwise false. API_LEVEL v1 only.
   * @param {boolean} [status=true] True to enable automatic STATUS messages, otherwise false. API_LEVEL v2 only.
   * @param {WorkflowMessages} [messages] Messages for the system dialog on iOS.
   * @param {CommandServiceOptions} [options] General command service options
   * @returns Message {@link AccessRights}
   */
  runAuth: (
    tcTokenURL: string,
    developerMode?: boolean,
    handleInterrupt?: boolean,
    status?: boolean,
    messages?: WorkflowMessages,
    options?: CommandServiceOptions
  ): Promise<AccessRights> =>
    sendCommand(
      AA2Commands.RunAuth,
      [AA2Messages.AccessRights],
      {
        tcTokenURL,
        developerMode,
        handleInterrupt,
        status,
        messages,
      },
      options
    ),
  /**
   * Starts a change PIN workflow.
   * https://www.ausweisapp.bund.de/sdk/commands.html#run-change-pin
   * @param {boolean} [handleInterrupt=false] True to automatically handle system dialog on iOS, otherwise false. API_LEVEL v1 only.
   * @param {boolean} [status=true] True to enable automatic STATUS messages, otherwise false. API_LEVEL v2 only.
   * @param {WorkflowMessages} [messages] Messages for the system dialog on iOS.
   * @param {CommandServiceOptions} [options] General command service options
   * @returns Messages {@link EnterPin} or {@link EnterCan} or {@link EnterPuk}
   */
  changePin: (
    handleInterrupt?: boolean,
    status?: boolean,
    messages?: WorkflowMessages,
    options?: CommandServiceOptions
  ): Promise<EnterPin | EnterCan | EnterPuk> =>
    sendCommand(
      AA2Commands.ChangePin,
      [AA2Messages.EnterPin, AA2Messages.EnterCan, AA2Messages.EnterPuk],
      {
        handleInterrupt,
        status,
        messages,
      },
      options
    ),
  /**
   * Returns information about the requested access rights.
   * https://www.ausweisapp.bund.de/sdk/commands.html#get-access-rights
   * @param {CommandServiceOptions} [options] General command service options
   * @returns Message {@link AccessRights}
   */
  getAccessRights: (options?: CommandServiceOptions): Promise<AccessRights> =>
    sendCommand(
      AA2Commands.GetAccessRights,
      [AA2Messages.AccessRights],
      {},
      options
    ),
  /**
   * Set effective access rights.
   * https://www.ausweisapp.bund.de/sdk/commands.html#set-access-rights
   * @param {AccessRight[]} chat List of enabled optional access rights. If you send an empty [] all optional access rights are disabled.
   * @param {CommandServiceOptions} [options] General command service options
   * @returns Message {@link AccessRights}
   */
  setAccessRights: (
    chat: AccessRight[],
    options?: CommandServiceOptions
  ): Promise<AccessRights> =>
    sendCommand(
      AA2Commands.SetAccessRights,
      [AA2Messages.AccessRights],
      {
        chat,
      },
      options
    ),
  /**
   * Insert “virtual” card.
   * https://www.ausweisapp.bund.de/sdk/commands.html#set-card
   * @param {string} name Name of the READER.
   * @param {Simulator} [simulator] Specific data for Simulator.
   */
  setCard: (name: string, simulator?: Simulator): void =>
    sendCommandWithoutResult(AA2Commands.SetCard, { name, simulator }),
  /**
   * Returns the certificate of current authentication.
   * https://www.ausweisapp.bund.de/sdk/commands.html#get-certificate
   * @param {CommandServiceOptions} [options] General command service options
   * @returns Message {@link Certificate}
   */
  getCertificate: (options?: CommandServiceOptions): Promise<Certificate> =>
    sendCommand(
      AA2Commands.GetCertificate,
      [AA2Messages.Certificate],
      {},
      options
    ),
  /**
   * Cancel the whole workflow.
   * https://www.ausweisapp.bund.de/sdk/commands.html#cancel
   * @param {CommandServiceOptions} [options] General command service options
   * @returns Messages {@link Auth} or {@link ChangePin}
   */
  cancel: (options?: CommandServiceOptions): Promise<Auth | ChangePin> =>
    sendCommand(
      AA2Commands.Cancel,
      [AA2Messages.Auth, AA2Messages.ChangePin],
      {},
      options,
      true
    ),
  /**
   * Accept the current state.
   * https://www.ausweisapp.bund.de/sdk/commands.html#accept
   * @param {CommandServiceOptions} [options] General command service options
   * @returns Messages {@link EnterPin} or {@link EnterCan} or {@link EnterPuk}
   */
  accept: (options?: CommandServiceOptions) =>
    sendCommand(
      AA2Commands.Accept,
      [AA2Messages.EnterPin, AA2Messages.EnterCan, AA2Messages.EnterPuk],
      {},
      options,
      false,
      throwAA2CardDeactivatedErrorOperator
    ),
  /**
   * Interrupts current system dialog on iOS.
   * https://www.ausweisapp.bund.de/sdk/commands.html#interrupt
   */
  interrupt: (): void => sendCommandWithoutResult(AA2Commands.Interrupt, {}),
  /**
   * Set PIN of inserted card.
   * https://www.ausweisapp.bund.de/sdk/commands.html#set-pin
   * @param {string} [value] The Personal Identification Number (PIN) of the card. This must be 6 digits in an AUTH workflow. If a CHANGE_PIN workflow is in progress the value must be 5 or 6 digits because of a possible transport PIN. If the READER has a keypad this parameter must be omitted.
   * @param {CommandServiceOptions} [options] General command service options
   * @returns Messages {@link EnterPin} or {@link EnterCan} or {@link EnterPuk} or {@link EnterNewPin} or {@link Auth}
   */
  setPin: (
    value?: string,
    options?: CommandServiceOptions
  ): Promise<EnterPin | EnterCan | EnterPuk | EnterNewPin | Auth> =>
    sendCommand(
      AA2Commands.SetPin,
      [
        AA2Messages.EnterPin,
        AA2Messages.EnterCan,
        AA2Messages.EnterPuk,
        AA2Messages.EnterNewPin,
        AA2Messages.Auth,
      ],
      { value },
      options,
      false,
      throwAA2CardDeactivatedErrorOperator
    ),
  /**
   * Set new PIN of inserted card.
   * https://www.ausweisapp.bund.de/sdk/commands.html#set-new-pin
   * @param {string} [value] The new personal identification number (PIN) of the card. This must be 6 digits if the READER has no keypad, otherwise this parameter must be omitted.
   * @param {CommandServiceOptions} [options] General command service options
   * @returns Message {@link ChangePin}
   */
  setNewPin: (
    value?: string,
    options?: CommandServiceOptions
  ): Promise<ChangePin> =>
    sendCommand(
      AA2Commands.SetNewPin,
      [AA2Messages.ChangePin],
      { value },
      options,
      false,
      throwAA2CardDeactivatedErrorOperator
    ),
  /**
   * Set CAN of inserted card.
   * https://www.ausweisapp.bund.de/sdk/commands.html#set-can
   * @param {string} [value] The Card Access Number (CAN) of the card. This must be 6 digits if the READER has no keypad, otherwise this parameter must be omitted.
   * @param {CommandServiceOptions} [options] General command service options
   * @returns Messages {@link EnterPin} or {@link EnterCan}
   */
  setCan: (
    value?: string,
    options?: CommandServiceOptions
  ): Promise<EnterCan | EnterPin> =>
    sendCommand(
      AA2Commands.SetCan,
      [AA2Messages.EnterCan, AA2Messages.EnterPin],
      { value },
      options,
      false,
      throwAA2CardDeactivatedErrorOperator
    ),
  /**
   * Set PUK of inserted card.
   * https://www.ausweisapp.bund.de/sdk/commands.html#set-puk
   * @param {string} [value] The Personal Unblocking Key (PUK) of the card. This must be 10 digits if the READER has no keypad, otherwise this parameter must be omitted.
   * @param {CommandServiceOptions} [options] General command service options
   * @returns Messages {@link EnterPin} or {@link EnterPuk}
   */
  setPuk: (
    value?: string,
    options?: CommandServiceOptions
  ): Promise<EnterPuk | EnterPin> =>
    sendCommand(
      AA2Commands.SetPuk,
      [AA2Messages.EnterPuk, AA2Messages.EnterPin],
      { value },
      options,
      false,
      throwAA2CardDeactivatedErrorOperator
    ),
  /**
   * Continues the workflow after a PAUSE was sent.
   *
   * The AusweisApp will send a PAUSE message with an appropriate cause for the waiting condition.
   * After the issue was fixed you have to send CONTINUE to go on with the workflow.
   * https://www.ausweisapp.bund.de/sdk/commands.html#continue
   * (Only API Level 3 or higher)
   */
  continue: (): void => sendCommandWithoutResult(AA2Commands.Continue, {}),
};
