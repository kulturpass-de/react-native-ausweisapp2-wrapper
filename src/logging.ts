import { Subscription, map, merge } from 'rxjs';
import { AA2MessageObservable } from './ausweisapp2-message-event-observables';
import { commandSubject } from './utils';

export let loggingSub: Subscription | undefined;

const beautifyJson = (value: any) => JSON.stringify(value, undefined, 2);

/**
 * Log all Messages and Commands sent by the AusweisApp2 SDK if toggle is true
 * @param toggle Start or stop logging
 */
export const logAA2Messages = (toggle: boolean) => {
  if (toggle) {
    const msgStrObs = AA2MessageObservable.pipe(
      map((msg) => `AusweisApp2 Message:\n${beautifyJson(msg)}`)
    );
    const cmdStrObs = commandSubject.pipe(
      map((cmd) => `AusweisApp2 Command:\n${beautifyJson(cmd)}`)
    );
    const newLoggingSub = merge(msgStrObs, cmdStrObs).subscribe((value) => {
      if (loggingSub === newLoggingSub) {
        console.log(value);
      } else {
        newLoggingSub.unsubscribe();
      }
    });
    loggingSub = newLoggingSub;
  } else {
    loggingSub?.unsubscribe();
    loggingSub = undefined;
  }
};
