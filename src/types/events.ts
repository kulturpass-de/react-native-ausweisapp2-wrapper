/**
 * NativeEventEmitter events, that can be sent from the native code
 */
export enum EventType {
  MessageEvent = 'message',
  ConnectedEvent = 'connected',
  Error = 'error',
  DisconnectedEvent = 'disconnected',
}
