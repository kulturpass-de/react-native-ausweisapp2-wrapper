import {
  CommandMessageList,
  MockAusweisApp2SDK,
} from '../../__mocks__/ausweisapp2-sdk-wrapper';

export const setupAA2SDKMock = (commandMessageList: CommandMessageList) => {
  jest.mock('../../ausweisapp2-sdk-wrapper');

  const mockSDK = require('../../ausweisapp2-sdk-wrapper')
    .AusweisApp2SDKWrapper as MockAusweisApp2SDK;

  mockSDK.commandMessageList = commandMessageList;

  jest.doMock('../../ausweisapp2-message-event-observables', () => {
    return {
      __esModule: true,
      AA2MessageObservable: mockSDK.messageSubject.asObservable(),
      AA2ConnectedObservable: mockSDK.connectedSubject.asObservable(),
      AA2DisconnectedObservable: mockSDK.disconnectedSubject.asObservable(),
      AA2ErrorObservable: mockSDK.errorSubject.asObservable(),
    };
  });
  return mockSDK;
};
