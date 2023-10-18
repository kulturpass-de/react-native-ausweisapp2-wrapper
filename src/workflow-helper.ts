import { Platform } from 'react-native';
import { Subscription, filter } from 'rxjs';

import { AA2MessageObservable } from './ausweisapp2-message-event-observables';
import { AusweisApp2SDKWrapper } from './ausweisapp2-sdk-wrapper';
import { AA2CommandService } from './command-service';
import { ErrorMessages, isCardDeactivated, isError } from './error-handling';
import { logAA2Messages } from './logging';
import type { InsertCard, Reader, Status } from './types/messages';
import { AA2Messages } from './types/messages';

class WorkflowHelper {
  /**
   * Start and initialize the AusweisApp2 SDK and set the API Level.
   * @param logging Enable or disable message logging
   * @param apiLevel The API level to be set (see https://www.ausweisapp.bund.de/sdk/commands.html#set-api-level)
   * @param startTimeout Timeout for the SDK startup (Initializes NFC on Android and the SDK itself)
   * @param apiCmdTimeout Timeout for the commands aligning the SDK API Level
   */
  public initializeAA2Sdk = async (
    logging: boolean,
    apiLevel: number,
    startTimeout?: number,
    apiCmdTimeout?: number
  ): Promise<void> => {
    logAA2Messages(logging);

    await AA2CommandService.start({ msTimeout: startTimeout });

    const apiLevelMsg = await AA2CommandService.getApiLevel({
      msTimeout: apiCmdTimeout,
    });

    if (!apiLevelMsg?.available?.includes(apiLevel)) {
      throw new Error('Requested API Level not available');
    }

    if (apiLevelMsg.current !== apiLevel) {
      await AA2CommandService.setApiLevel(apiLevel, {
        msTimeout: apiCmdTimeout,
      });
    }
  };

  /**
   * Attach handler to InsertCard Message. Mostly used for simulating a card.
   * @param handler Handler callback
   * @returns Subscription which has to be unsubscribed to remove handler
   */
  public handleInsertCard = (
    handler: (message: InsertCard) => void
  ): Subscription => {
    return AA2MessageObservable.pipe(
      filter((msg): msg is InsertCard => msg.msg === AA2Messages.InsertCard)
    ).subscribe(handler);
  };

  /**
   * Attach handler to Reader Message containing a non-deactivated card. Used to act on inserted card.
   * @param handler Handler callback
   * @returns Subscription which has to be unsubscribed to remove handler
   */
    public handleInsertedCard = (
      handler: (message: Reader) => void
    ): Subscription => {
      return AA2MessageObservable.pipe(
        filter((msg): msg is Reader => msg.msg === AA2Messages.Reader && msg.card?.deactivated == false)
      ).subscribe(handler);
    };


  /**
   * Attach handler to Status Message containing Auth information. Used for monitoring auth progress.
   * @param handler Handler callback
   * @returns Subscription which has to be unsubscribed to remove handler
   */
      public handleAuthStatus = (
        handler: (message: Status) => void
      ): Subscription => {
        return AA2MessageObservable.pipe(
          filter((msg): msg is Status => msg.msg === AA2Messages.Status && msg.workflow == "AUTH")
        ).subscribe(handler);
      };

  /**
   * Attach handler for error handling. Handles BadState, InternalError, Invalid, UnknownCommand and errors in Auth, ChangePin as well as deactivated card Reader messages.
   * @param handler Handler callback
   * @returns Subscription which has to be unsubscribed to remove handler
   */
  public handleError = (
    handler: (message: ErrorMessages | Reader) => void
  ): Subscription => {
    return AA2MessageObservable.pipe(
      filter(
        (msg): msg is ErrorMessages | Reader =>
          isError(msg) || isCardDeactivated(msg)
      )
    ).subscribe(handler);
  };

  /**
   * Check if the necessary reader is available
   * @param simulatorActive Indicate if simulated reader should be used
   * @param readerName Name of the reader to be used. Defaults to `NFC`
   * @returns True if the necessary reader is available
   */
  public readerIsAvailable = async (
    simulatorActive: boolean,
    readerName: string = 'NFC',
    readerListCmdTimeout?: number
  ): Promise<boolean> => {
    const readerList = await AA2CommandService.getReaderList({
      msTimeout: readerListCmdTimeout,
    });
    const intReaderName = simulatorActive ? 'Simulator' : readerName;
    return readerList.readers.some((reader) => reader.name === intReaderName);
  };

  /**
   * Check if NFC is enabled. Only available on Android.
   * @returns boolean indicating NFC enabled state
   */
  public isNfcEnabled = async (): Promise<boolean | undefined> => {
    if (Platform.OS !== 'android') {
      throw Error('This method is only available on Android');
    }
    return AusweisApp2SDKWrapper.isNfcEnabled();
  };

  /**
   * Open NFC Settings. Only available on Android.
   * @throws if error occured while opening NFC settings
   */
  public openNfcSettings = async () => {
    if (Platform.OS !== 'android') {
      throw Error('This method is only available on Android');
    }
    return AusweisApp2SDKWrapper.openNfcSettings();
  };
}

export const AA2WorkflowHelper = new WorkflowHelper();
