import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-ausweisapp2-wrapper' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

/**
 * Function interface for Android and iOS Native Modules
 */
export type IAusweisApp2SDKWrapper = {
  start: () => void;
  stop: () => void;
  send: (command: string) => void;
  isRunning: () => Promise<boolean>;
  // Android only
  isNfcEnabled: () => Promise<boolean | undefined>;
  // Android only
  openNfcSettings: () => Promise<void>;
};

/**
 * Native AusweisApp2SDKWrapper Module exposing Android and iOS functions
 */
export const AusweisApp2SDKWrapper: IAusweisApp2SDKWrapper =
  NativeModules.Ausweisapp2Wrapper
    ? NativeModules.Ausweisapp2Wrapper
    : new Proxy(
        {},
        {
          get() {
            throw new Error(LINKING_ERROR);
          },
        }
      );
