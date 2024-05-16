import {
  OperatorFunction,
  Subject,
  filter,
  firstValueFrom,
  merge,
  timeout,
} from 'rxjs';
import { AA2MessageObservable } from './ausweisapp2-message-event-observables';
import { AA2Commands, Command, Commands } from './types/commands';
import { AA2Messages, Message, Messages } from './types/messages';
import { AusweisApp2SDKWrapper } from './ausweisapp2-sdk-wrapper';
import { CommandServiceOptions } from './command-service';
import {
  InternalErrorObservable,
  throwAA2BasicErrorsOperator,
  throwAA2ErrorsOperator,
} from './error-handling';
import { loggingSub } from './logging';

// Only used for Command logging
export const commandSubject = new Subject<Commands>();

/**
 * Send a Command to the AusweisApp SDK without waiting for a Message response.
 * @param command The Command string, to be sent to the SDK
 * @param args Arguments provided alongside the Command
 */
export const sendCommandWithoutResult = <
  AC extends AA2Commands,
  Args extends Command<AC>,
>(
  command: AC,
  args: Omit<Args, 'cmd'>
) => {
  const commandObj = { cmd: command, ...args };
  if (loggingSub !== undefined) {
    commandSubject.next(commandObj as Commands);
  }
  AusweisApp2SDKWrapper.send(JSON.stringify(commandObj));
};

/**
 * Default timeout for commands
 */
export const DEFAULT_TIMEOUT = 40000; /* 40 seconds */

/**
 * Sends a Command to the AusweisApp SDK and resolves asynchronously with a Message response.
 * @param command The Command string, to be sent to the SDK
 * @param expectedMessages The expected Messages that are valid responses to the Command
 * @param args Arguments provided alongside the Command
 * @param options Options the API user can provide to the Command invocation. (i.e. msTimeout)
 * @param onlyBasicErrors If true, Auth and ChangePin errors are ignored. Can be used if the Command is not specific to an Auth or ChangePin workflow.
 * @param operator An operator, that will be applied to the incoming Messages. Can be used to filter or throw Messages.
 * @returns A Promise that can be awaited for one of the expectedMessages
 */
export const sendCommand = async <
  AM extends AA2Messages[],
  AC extends AA2Commands,
  Result extends Message<AM[0]>,
  Args extends Command<AC>,
>(
  command: AC,
  expectedMessages: AM,
  args: Omit<Args, 'cmd'>,
  options?: CommandServiceOptions,
  onlyBasicErrors: boolean = false,
  operator?: OperatorFunction<Messages, Messages>
): Promise<Result> => {
  const observable =
    operator !== undefined
      ? AA2MessageObservable.pipe(operator)
      : AA2MessageObservable;
  const resultMsg = firstValueFrom(
    merge(
      observable.pipe(
        onlyBasicErrors ? throwAA2BasicErrorsOperator : throwAA2ErrorsOperator,
        filter((msg): msg is Result => expectedMessages.includes(msg.msg))
      ),
      InternalErrorObservable
    ).pipe(timeout({ first: options?.msTimeout ?? DEFAULT_TIMEOUT }))
  );
  sendCommandWithoutResult(command, args);
  return resultMsg;
};
