import { setupAA2SDKMock } from './utils/mocked-ausweisapp2-sdk';
import BasicFlowJson from './flows/basic-flow.json';
import CanAuthJson from './flows/can-auth.json';
import CancelAuthJson from './flows/cancel-auth.json';
import PinChangeJson from './flows/pin-change.json';
import SetAccessRightsJson from './flows/set-access-rights.json';
import MissingCommandsJson from './flows/missing-commands.json';
import {
  AA2Messages,
  Auth,
  ChangePin,
  Info,
  Invalid,
  Reader,
} from '../types/messages';
import {
  AccessRight,
  FailureCodes,
  InfoAusweisApp,
} from '../types/auxiliary_types';
import { Observable } from 'rxjs';

describe('AA2CommandService', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  /**
   * https://www.ausweisapp.bund.de/sdk/workflow.html#minimal-successful-authentication
   */
  test('Minimal successful authentication', async () => {
    setupAA2SDKMock(BasicFlowJson as any);

    const { AA2CommandService } = require('../command-service');

    await AA2CommandService.start();

    const accessRightsMsg = await AA2CommandService.runAuth(
      'https://test.governikus-eid.de/DEMO'
    );
    expect(accessRightsMsg.msg).toBe(AA2Messages.AccessRights);
    expect(accessRightsMsg.chat.optional[0]).toBe(AccessRight.GivenNames);

    const enterPinMsg = await AA2CommandService.accept();
    expect(enterPinMsg.msg).toBe(AA2Messages.EnterPin);
    expect(enterPinMsg.reader?.name).toBe('NFC');

    const authMsg = await AA2CommandService.setPin('123456');
    expect(authMsg.msg).toBe(AA2Messages.Auth);
    expect((authMsg as Auth).url).toBe(
      'https://test.governikus-eid.de/DEMO/?refID=123456'
    );

    await AA2CommandService.stop();
  });

  /**
   * https://www.ausweisapp.bund.de/sdk/workflow.html#successful-authentication-with-can
   */
  test('Successful authentication with CAN', async () => {
    setupAA2SDKMock(CanAuthJson as any);

    const { AA2CommandService } = require('../command-service');

    await AA2CommandService.start();

    const accessRightsMsg = await AA2CommandService.runAuth(
      'https://test.governikus-eid.de/DEMO'
    );
    expect(accessRightsMsg.msg).toBe(AA2Messages.AccessRights);
    expect(accessRightsMsg.chat.effective[0]).toBe(AccessRight.DocumentType);

    const enterPinMsg = await AA2CommandService.accept();
    expect(enterPinMsg.msg).toBe(AA2Messages.EnterPin);
    expect(enterPinMsg.reader?.name).toBe('NFC');
    expect(enterPinMsg.reader?.card?.retryCounter).toBe(3);

    const enterPin2Msg = await AA2CommandService.setPin('000000');
    expect(enterPin2Msg.msg).toBe(AA2Messages.EnterPin);
    expect(enterPin2Msg.reader?.name).toBe('NFC');
    expect(enterPin2Msg.reader?.card?.retryCounter).toBe(2);

    const enterCanMsg = await AA2CommandService.setPin('000001');
    expect(enterCanMsg.msg).toBe(AA2Messages.EnterCan);
    expect(enterCanMsg.reader?.name).toBe('NFC');
    expect(enterCanMsg.reader?.card?.retryCounter).toBe(1);

    const enterCan2Msg = await AA2CommandService.setCan('000000');
    expect(enterCan2Msg.msg).toBe(AA2Messages.EnterCan);
    expect(enterCan2Msg.reader?.name).toBe('NFC');
    expect(enterCan2Msg.reader?.card?.retryCounter).toBe(1);

    const enterPin3Msg = await AA2CommandService.setCan('654321');
    expect(enterPin3Msg.msg).toBe(AA2Messages.EnterPin);
    expect(enterPin3Msg.reader?.name).toBe('NFC');
    expect(enterPin3Msg.reader?.card?.retryCounter).toBe(1);

    const authMsg = await AA2CommandService.setPin('123456');
    expect(authMsg.msg).toBe(AA2Messages.Auth);
    expect((authMsg as Auth).url).toBe(
      'https://test.governikus-eid.de/DEMO/?refID=123456'
    );

    await AA2CommandService.stop();
  });

  /**
   * https://www.ausweisapp.bund.de/sdk/workflow.html#cancelled-authentication
   */
  test('Cancelled authentication', async () => {
    setupAA2SDKMock(CancelAuthJson as any);

    const { AA2CommandService } = require('../command-service');

    await AA2CommandService.start();

    const accessRightsMsg = await AA2CommandService.runAuth(
      'https://test.governikus-eid.de/DEMO'
    );
    expect(accessRightsMsg.msg).toBe(AA2Messages.AccessRights);
    expect(accessRightsMsg.chat.effective[0]).toBe(AccessRight.DocumentType);

    const authMsg = await AA2CommandService.cancel();
    expect(authMsg.msg).toBe(AA2Messages.Auth);
    expect((authMsg as Auth).result?.major).toBe(
      'http://www.bsi.bund.de/ecard/api/1.1/resultmajor#error'
    );

    await AA2CommandService.stop();
  });

  /**
   * https://www.ausweisapp.bund.de/sdk/workflow.html#set-some-access-rights
   */
  test('Set some access rights', async () => {
    setupAA2SDKMock(SetAccessRightsJson as any);

    const { AA2CommandService } = require('../command-service');

    await AA2CommandService.start();

    const accessRightsMsg = await AA2CommandService.runAuth(
      'https://test.governikus-eid.de/DEMO'
    );
    expect(accessRightsMsg.msg).toBe(AA2Messages.AccessRights);
    expect(accessRightsMsg.chat.optional[0]).toBe(AccessRight.GivenNames);
    expect(accessRightsMsg.chat.effective.length).toBe(3);

    const accessRights2Msg = await AA2CommandService.setAccessRights([]);
    expect(accessRights2Msg.msg).toBe(AA2Messages.AccessRights);
    expect(accessRights2Msg.chat.optional[0]).toBe(AccessRight.GivenNames);
    expect(accessRights2Msg.chat.effective.length).toBe(2);

    const accessRights3Msg = await AA2CommandService.setAccessRights([
      AccessRight.GivenNames,
    ]);
    expect(accessRights3Msg.msg).toBe(AA2Messages.AccessRights);
    expect(accessRights3Msg.chat.optional[0]).toBe(AccessRight.GivenNames);
    expect(accessRights3Msg.chat.effective.length).toBe(3);

    const authMsg = await AA2CommandService.cancel();
    expect(authMsg.msg).toBe(AA2Messages.Auth);
    expect((authMsg as Auth).result?.major).toBe(
      'http://www.bsi.bund.de/ecard/api/1.1/resultmajor#error'
    );

    await AA2CommandService.stop();
  });

  /**
   * https://www.ausweisapp.bund.de/sdk/workflow.html#minimal-successful-pin-change
   */
  test('Minimal successful PIN change', async () => {
    setupAA2SDKMock(PinChangeJson as any);

    const { AA2CommandService } = require('../command-service');

    await AA2CommandService.start();

    const enterPinMsg = await AA2CommandService.changePin();
    expect(enterPinMsg.msg).toBe(AA2Messages.EnterPin);
    expect(enterPinMsg.reader?.name).toBe('NFC');

    const enterNewPinMsg = await AA2CommandService.setPin('123456');
    expect(enterNewPinMsg.msg).toBe(AA2Messages.EnterNewPin);
    expect(enterNewPinMsg.reader?.name).toBe('NFC');

    const authMsg = await AA2CommandService.setNewPin('123456');
    expect(authMsg.msg).toBe(AA2Messages.ChangePin);
    expect((authMsg as ChangePin).success).toBe(true);

    await AA2CommandService.stop();
  });

  test('Start should not start and stop twice', async () => {
    const mockSDK = setupAA2SDKMock([]);

    jest.spyOn(console, 'warn').mockImplementation(() => {});

    const { AA2CommandService } = require('../command-service');

    let connectedCounter = 0;
    const connectedSub = mockSDK.connectedSubject.subscribe(
      () => (connectedCounter += 1)
    );

    expect(mockSDK.initialized).toBe(false);
    expect(connectedCounter).toBe(0);
    await AA2CommandService.start();

    expect(mockSDK.initialized).toBe(true);
    expect(connectedCounter).toBe(1);
    expect(await AA2CommandService.isRunning()).toBe(true);

    await AA2CommandService.start();

    expect(mockSDK.initialized).toBe(true);
    expect(connectedCounter).toBe(1);
    expect(await AA2CommandService.isRunning()).toBe(true);

    connectedSub.unsubscribe();

    let disconnectedCounter = 0;
    const disconnectedSub = mockSDK.disconnectedSubject.subscribe(
      () => (disconnectedCounter += 1)
    );

    expect(disconnectedCounter).toBe(0);
    await AA2CommandService.stop();

    expect(mockSDK.initialized).toBe(false);
    expect(disconnectedCounter).toBe(1);
    expect(await AA2CommandService.isRunning()).toBe(false);

    await AA2CommandService.stop();
    expect(mockSDK.initialized).toBe(false);
    expect(disconnectedCounter).toBe(1);
    expect(await AA2CommandService.isRunning()).toBe(false);

    disconnectedSub.unsubscribe();
  });

  test('Missing commands', async () => {
    setupAA2SDKMock(MissingCommandsJson as any);

    const { AA2CommandService } = require('../command-service');

    await AA2CommandService.start();

    const infoMsg = await AA2CommandService.getInfo();
    expect(infoMsg.msg).toBe(AA2Messages.Info);
    expect(infoMsg.VersionInfo.Name).toBe('AusweisApp2');
    expect(infoMsg.AusweisApp).toBe(InfoAusweisApp.CONNECTED);

    const statusMsg = await AA2CommandService.getStatus();
    expect(statusMsg.msg).toBe(AA2Messages.Status);
    expect(statusMsg.progress).toBe(25);

    const apiLevelMsg = await AA2CommandService.getApiLevel();
    expect(apiLevelMsg.msg).toBe(AA2Messages.ApiLevel);
    expect(apiLevelMsg.current).toBe(4);

    const apiLevel2Msg = await AA2CommandService.setApiLevel(4);
    expect(apiLevel2Msg.msg).toBe(AA2Messages.ApiLevel);
    expect(apiLevel2Msg.current).toBe(4);

    const readerMsg = await AA2CommandService.getReader('NFC');
    expect(readerMsg.msg).toBe(AA2Messages.Reader);
    expect(readerMsg.name).toBe('NFC');

    const readerListMsg = await AA2CommandService.getReaderList();
    expect(readerListMsg.msg).toBe(AA2Messages.ReaderList);
    expect(readerListMsg.readers.length).toBe(2);

    const accessRightsMsg = await AA2CommandService.getAccessRights();
    expect(accessRightsMsg.msg).toBe(AA2Messages.AccessRights);
    expect(accessRightsMsg.chat.effective.length).toBe(4);

    AA2CommandService.setCard('Simulator', { files: [], keys: [] });

    const certificateMsg = await AA2CommandService.getCertificate();
    expect(certificateMsg.msg).toBe(AA2Messages.Certificate);
    expect(certificateMsg.description.issuerName).toBe('Governikus Test DVCA');

    AA2CommandService.interrupt();

    const enterPukMsg = await AA2CommandService.setPuk('123456789');
    expect(enterPukMsg.msg).toBe(AA2Messages.EnterPuk);
    expect(enterPukMsg.error).toBe('You must provide 10 digits');

    AA2CommandService.continue();

    await AA2CommandService.stop();
  });

  test('Auth should throw on Auth error', async () => {
    const authMsgError: Auth = {
      msg: AA2Messages.Auth,
      result: {
        description: 'A trusted channel could not be opened.',
        language: 'en',
        major: 'http://test.governikus-eid.de/DEMO/api/1.1/resultmajor#error',
        message:
          'An unknown network error occurred. Check your network connection and try to restart the app.',
        minor:
          'http://test.governikus-eid.de/DEMO/api/1.1/resultminor/dp#trustedChannelEstablishmentFailed',
        reason: FailureCodes.Get_TcToken_Network_Error,
      },
    };
    setupAA2SDKMock([
      {
        command: {
          cmd: 'RUN_AUTH',
          tcTokenURL: 'https://test.governikus-eid.de/DEMO',
        },
        messages: [
          {
            msg: 'STATUS',
            progress: 80,
            state: null,
            workflow: 'AUTH',
          },
          authMsgError,
        ],
      },
    ] as any);

    const { AA2CommandService } = require('../command-service');

    await AA2CommandService.start();
    await expect(
      AA2CommandService.runAuth('https://test.governikus-eid.de/DEMO')
    ).rejects.toBe(authMsgError);
    await AA2CommandService.stop();
  });

  test('Accept should throw on Auth error', async () => {
    const authMsgError: Auth = {
      msg: AA2Messages.Auth,
      result: {
        description: 'A trusted channel could not be opened.',
        language: 'en',
        major: 'http://test.governikus-eid.de/DEMO/api/1.1/resultmajor#error',
        message:
          'An unknown network error occurred. Check your network connection and try to restart the app.',
        minor:
          'http://test.governikus-eid.de/DEMO/api/1.1/resultminor/dp#trustedChannelEstablishmentFailed',
        reason: FailureCodes.Connect_Card_Eid_Inactive,
      },
    };
    setupAA2SDKMock([
      {
        command: {
          cmd: 'ACCEPT',
        },
        messages: [
          {
            msg: 'STATUS',
            progress: 80,
            state: null,
            workflow: 'AUTH',
          },
          authMsgError,
        ],
      },
    ] as any);

    const { AA2CommandService } = require('../command-service');

    await AA2CommandService.start();
    await expect(AA2CommandService.accept()).rejects.toBe(authMsgError);
    await AA2CommandService.stop();
  });

  test('getInfo should throw only on basic error', async () => {
    const authMsgError: Auth = {
      msg: AA2Messages.Auth,
      result: {
        description: 'A trusted channel could not be opened.',
        language: 'en',
        major: 'http://test.governikus-eid.de/DEMO/api/1.1/resultmajor#error',
        message:
          'An unknown network error occurred. Check your network connection and try to restart the app.',
        minor:
          'http://test.governikus-eid.de/DEMO/api/1.1/resultminor/dp#trustedChannelEstablishmentFailed',
        reason: FailureCodes.Connect_Card_Eid_Inactive,
      },
    };
    const invalidMsgError: Invalid = {
      msg: AA2Messages.Invalid,
      error: 'test error',
    };
    const infoMsg: Info = {
      msg: AA2Messages.Info,
      VersionInfo: {
        'Name': 'AusweisApp2',
        'Implementation-Title': 'AusweisApp2',
        'Implementation-Vendor': 'Governikus GmbH & Co. KG',
        'Implementation-Version': '1.10.0',
        'Specification-Title': 'TR-03124',
        'Specification-Vendor': 'Federal Office for Information Security',
        'Specification-Version': '1.2',
      },
    };
    setupAA2SDKMock([
      {
        command: {
          cmd: 'GET_INFO',
        },
        messages: [invalidMsgError],
      },
      {
        command: {
          cmd: 'GET_INFO',
        },
        messages: [authMsgError, infoMsg],
      },
    ] as any);

    const { AA2CommandService } = require('../command-service');

    await AA2CommandService.start();
    await expect(AA2CommandService.getInfo()).rejects.toBe(invalidMsgError);
    await expect(AA2CommandService.getInfo()).resolves.toBe(infoMsg);
    await AA2CommandService.stop();
  });

  test('Accept should throw on basic error', async () => {
    const invalidMsgError: Invalid = {
      msg: AA2Messages.Invalid,
      error: 'test error',
    };
    setupAA2SDKMock([
      {
        command: {
          cmd: 'ACCEPT',
        },
        messages: [
          {
            msg: 'STATUS',
            progress: 80,
            state: null,
            workflow: 'AUTH',
          },
          invalidMsgError,
        ],
      },
    ] as any);

    const { AA2CommandService } = require('../command-service');

    await AA2CommandService.start();
    await expect(AA2CommandService.accept()).rejects.toBe(invalidMsgError);
    await AA2CommandService.stop();
  });

  test('Accept should throw on deactivated card', async () => {
    const readerMsgError: Reader = {
      attached: true,
      card: {
        deactivated: true,
        inoperative: false,
        retryCounter: 0,
      },
      insertable: false,
      keypad: false,
      msg: AA2Messages.Reader,
      name: 'NFC',
    };
    setupAA2SDKMock([
      {
        command: {
          cmd: 'ACCEPT',
        },
        messages: [
          {
            msg: 'STATUS',
            progress: 80,
            state: null,
            workflow: 'AUTH',
          },
          readerMsgError,
        ],
      },
    ] as any);

    const { AA2CommandService } = require('../command-service');

    await AA2CommandService.start();
    await expect(AA2CommandService.accept()).rejects.toBe(readerMsgError);
    await AA2CommandService.stop();
  });

  test('commands should throw TimeoutError', async () => {
    setupAA2SDKMock([
      {
        command: {
          cmd: 'RUN_AUTH',
          tcTokenURL: 'https://test.governikus-eid.de/DEMO',
        },
        messages: [
          {
            msg: 'STATUS',
            progress: 80,
            state: null,
            workflow: 'AUTH',
          },
        ],
      },
    ] as any);

    const { AA2CommandService } = require('../command-service');

    await AA2CommandService.start();
    await expect(
      AA2CommandService.runAuth(
        'https://test.governikus-eid.de/DEMO',
        undefined,
        undefined,
        undefined,
        undefined,
        {
          msTimeout: 500,
        }
      )
    ).rejects.toThrow('Timeout has occurred');
    await AA2CommandService.stop();
  });

  test('Command should throw on internal error', async () => {
    const mockSDK = setupAA2SDKMock([
      {
        command: {
          cmd: 'ACCEPT',
        },
        messages: [
          {
            msg: 'STATUS',
            progress: 80,
            state: null,
            workflow: 'AUTH',
          },
        ],
      },
    ] as any);

    const { AA2CommandService } = require('../command-service');

    await AA2CommandService.start();
    const acceptPromise = AA2CommandService.accept();
    mockSDK.errorSubject.next('TEST ERROR');
    await expect(acceptPromise).rejects.toThrow('TEST ERROR');
    await AA2CommandService.stop();
  });

  test('start and stop should throw TimeoutError', async () => {
    const start = jest.fn();
    const stop = jest.fn();
    const isRunning = jest.fn();
    jest.doMock('../ausweisapp2-sdk-wrapper', () => {
      return {
        __esModule: true,
        AusweisApp2SDKWrapper: {
          start,
          stop,
          isRunning,
        },
      };
    });

    jest.doMock('../ausweisapp2-message-event-observables', () => {
      return {
        __esModule: true,
        AA2ConnectedObservable: new Observable(),
        AA2DisconnectedObservable: new Observable(),
        AA2ErrorObservable: new Observable(),
      };
    });

    const { AA2CommandService } = require('../command-service');

    isRunning.mockImplementationOnce(() => Promise.resolve(false));
    await expect(AA2CommandService.start({ msTimeout: 500 })).rejects.toThrow(
      'Timeout has occurred'
    );

    isRunning.mockImplementationOnce(() => Promise.resolve(true));
    await expect(AA2CommandService.stop({ msTimeout: 500 })).rejects.toThrow(
      'Timeout has occurred'
    );
  });
});
