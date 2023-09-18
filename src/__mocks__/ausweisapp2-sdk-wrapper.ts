import isEqual from 'lodash.isequal';
import { Subject } from 'rxjs';

import { IAusweisApp2SDKWrapper } from '../ausweisapp2-sdk-wrapper';
import { Commands } from '../types/commands';
import { Messages } from '../types/messages';

export type CommandMessageList = Array<{
  command: Commands;
  messages: Messages[];
}>;

const sleepFor = async (ms: number) => new Promise((r) => setTimeout(r, ms));

export class MockAusweisApp2SDK implements IAusweisApp2SDKWrapper {
  public commandMessageList: CommandMessageList;
  public initialized = false;
  public enabled = true;

  public messageSubject = new Subject<Messages>();
  public connectedSubject = new Subject<void>();
  public errorSubject = new Subject<string | undefined>();
  public disconnectedSubject = new Subject<void>();

  constructor(commandMessageList: CommandMessageList) {
    this.commandMessageList = commandMessageList;
  }

  public start() {
    this.initialized = true;
    this.connectedSubject.next();
  }

  public stop() {
    this.initialized = false;
    this.disconnectedSubject.next();
  }

  public send(command: string): void {
    if (!this.initialized) {
      throw Error('Not initialized');
    }

    const cmdObj = JSON.parse(command);
    const [firstCmd, ...rest] = this.commandMessageList;

    if (firstCmd === undefined || !isEqual(firstCmd?.command, cmdObj)) {
      throw Error(`${command} does not match ${JSON.stringify(firstCmd)}`);
    }
    this.commandMessageList = rest;
    (async () => {
      for (const msg of firstCmd.messages) {
        await sleepFor(Math.random() * 100);
        this.messageSubject.next(msg);
      }
    })();
  }

  public isRunning() {
    return Promise.resolve(this.initialized);
  }

  public isNfcEnabled() {
    return Promise.resolve(this.enabled);
  }

  public openNfcSettings() {
    return Promise.resolve();
  }
}

export const AusweisApp2SDKWrapper = new MockAusweisApp2SDK([]);
