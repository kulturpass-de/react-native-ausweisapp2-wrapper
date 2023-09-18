import { NativeEventEmitter } from 'react-native';
import { Observable, map, share } from 'rxjs';

import { AusweisApp2SDKWrapper } from './ausweisapp2-sdk-wrapper';
import { EventType } from './types/events';
import { Messages } from './types/messages';

const NativeAA2EventEmitter = new NativeEventEmitter(
  AusweisApp2SDKWrapper as any
);

/**
 * Convenience function to create an RxJS Observable from NativeEventEmitter events.
 * @param eventType String that identifies the native side event
 * @returns Observable that emits the events data if subscribed to.
 */
const createAA2EventObservable = (
  eventType: EventType
): Observable<unknown> => {
  const eventObs = new Observable((subscriber) => {
    const listener = NativeAA2EventEmitter.addListener(eventType, (data) => {
      subscriber.next(data);
    });

    subscriber.add(() => {
      listener.remove();
    });
  });

  // Share event Observable, so that there is only one subscription to the NativeEventEmitter per eventType at a time
  return eventObs.pipe(share());
};

/**
 * Observable that emits AusweisApp2 SDK Messages
 */
export const AA2MessageObservable = createAA2EventObservable(
  EventType.MessageEvent
).pipe(map((msg): Messages => JSON.parse(msg as string)));

/**
 * Observable that emits if the AusweisApp2 SDK is started successfully
 */
export const AA2ConnectedObservable = createAA2EventObservable(
  EventType.ConnectedEvent
) as Observable<void>;

/**
 * Observable that emits if the native code errored
 */
export const AA2ErrorObservable = createAA2EventObservable(
  EventType.Error
) as Observable<string | undefined>;

/**
 * Observable that emits if the AusweisApp2 SDK is stopped successfully
 */
export const AA2DisconnectedObservable = createAA2EventObservable(
  EventType.DisconnectedEvent
) as Observable<void>;
