import { AA2Commands } from '../types/commands';
import { setupAA2SDKMock } from './utils/mocked-ausweisapp2-sdk';
import {
  AA2Messages,
  Auth,
  ChangePin,
  InsertCard,
  Invalid,
  Pause,
  Reader,
} from '../types/messages';
import { FailureCodes, PauseCauses } from '../types/auxiliary_types';
import { CommandMessageList } from '../__mocks__/ausweisapp2-sdk-wrapper';
import { Platform } from 'react-native';

describe('AA2WorkflowHelper', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('initializeAA2Sdk', () => {
    test('should set api level', async () => {
      const commandMessageList: CommandMessageList = [
        {
          command: { cmd: AA2Commands.GetApiLevel },
          messages: [
            { msg: AA2Messages.ApiLevel, available: [1, 2], current: 1 },
          ],
        },
        {
          command: { cmd: AA2Commands.SetApiLevel, level: 2 },
          messages: [
            { msg: AA2Messages.ApiLevel, available: [1, 2], current: 2 },
          ],
        },
      ];
      const mockSDK = setupAA2SDKMock(commandMessageList);

      const { AA2WorkflowHelper } = require('../workflow-helper');
      expect(mockSDK.initialized).toBe(false);

      await AA2WorkflowHelper.initializeAA2Sdk(false, 2);
      expect(mockSDK.initialized).toBe(true);
    });

    test('should not set api level', async () => {
      const commandMessageList: CommandMessageList = [
        {
          command: { cmd: AA2Commands.GetApiLevel },
          messages: [
            { msg: AA2Messages.ApiLevel, available: [1, 2], current: 2 },
          ],
        },
      ];
      const mockSDK = setupAA2SDKMock(commandMessageList);

      const { AA2WorkflowHelper } = require('../workflow-helper');
      expect(mockSDK.initialized).toBe(false);

      await AA2WorkflowHelper.initializeAA2Sdk(false, 2);
      expect(mockSDK.initialized).toBe(true);
    });

    test('should thrown an error', async () => {
      const commandMessageList: CommandMessageList = [
        {
          command: { cmd: AA2Commands.GetApiLevel },
          messages: [{ msg: AA2Messages.ApiLevel, available: [1], current: 1 }],
        },
      ];
      const mockSDK = setupAA2SDKMock(commandMessageList);

      const { AA2WorkflowHelper } = require('../workflow-helper');
      expect(mockSDK.initialized).toBe(false);

      await expect(
        AA2WorkflowHelper.initializeAA2Sdk(false, 2)
      ).rejects.toThrow();
    });
  });

  describe('handleInsertCard', () => {
    test('should call handler', async () => {
      const insertCardMsg: InsertCard = { msg: AA2Messages.InsertCard };
      const commandMessageList: CommandMessageList = [
        {
          command: { cmd: AA2Commands.Accept },
          messages: [insertCardMsg, { msg: AA2Messages.EnterPin }],
        },
      ];
      setupAA2SDKMock(commandMessageList);

      const { AA2WorkflowHelper } = require('../workflow-helper');
      const { AA2CommandService } = require('../command-service');
      await AA2CommandService.start();

      const mockedHandler = jest.fn();

      const sub = AA2WorkflowHelper.handleInsertCard(mockedHandler);

      expect(mockedHandler.mock.calls.length).toBe(0);

      await AA2CommandService.accept();

      expect(mockedHandler.mock.calls.length).toBe(1);
      expect(mockedHandler.mock.calls[0][0]).toEqual(insertCardMsg);

      sub.unsubscribe();
      await AA2CommandService.stop();
    });
  });

  describe('handlePause', () => {
    test('should call handler', async () => {
      const pauseMsg: Pause = {
        msg: AA2Messages.Pause,
        cause: PauseCauses.BadCardPosition,
      };
      const commandMessageList: CommandMessageList = [
        {
          command: { cmd: AA2Commands.Accept },
          messages: [pauseMsg, { msg: AA2Messages.EnterPin }],
        },
      ];
      setupAA2SDKMock(commandMessageList);

      const { AA2WorkflowHelper } = require('../workflow-helper');
      const { AA2CommandService } = require('../command-service');
      await AA2CommandService.start();

      const mockedHandler = jest.fn();

      const sub = AA2WorkflowHelper.handlePause(mockedHandler);

      expect(mockedHandler.mock.calls.length).toBe(0);

      await AA2CommandService.accept();

      expect(mockedHandler.mock.calls.length).toBe(1);
      expect(mockedHandler.mock.calls[0][0]).toEqual(pauseMsg);

      sub.unsubscribe();
      await AA2CommandService.stop();
    });
  });

  describe('handleError', () => {
    test('should handle basic errors', async () => {
      const invalidMsg: Invalid = { msg: AA2Messages.Invalid, error: 'Test' };
      const commandMessageList: CommandMessageList = [
        {
          command: { cmd: AA2Commands.Accept },
          messages: [invalidMsg],
        },
      ];
      setupAA2SDKMock(commandMessageList);

      const { AA2WorkflowHelper } = require('../workflow-helper');
      const { AA2CommandService } = require('../command-service');

      await AA2CommandService.start();

      const mockedHandler = jest.fn();
      const sub = AA2WorkflowHelper.handleError(mockedHandler);

      expect(mockedHandler.mock.calls.length).toBe(0);

      await expect(AA2CommandService.accept()).rejects.toEqual(invalidMsg);

      expect(mockedHandler.mock.calls.length).toBe(1);
      expect(mockedHandler.mock.calls[0][0]).toEqual(invalidMsg);

      sub.unsubscribe();
      await AA2CommandService.stop();
    });

    test('should handle auth errors', async () => {
      const authErrorMsg: Auth = {
        msg: AA2Messages.Auth,
        result: {
          description: 'The process has been cancelled.',
          language: 'en',
          major: 'http://www.bsi.bund.de/ecard/api/1.1/resultmajor#error',
          message: 'The process has been cancelled.',
          minor:
            'http://www.bsi.bund.de/ecard/api/1.1/resultminor/sal#cancellationByUser',
          reason: FailureCodes.User_Cancelled,
        },
        url: 'https://test.governikus-eid.de/DEMO/?errID=123456',
      };
      const commandMessageList: CommandMessageList = [
        {
          command: { cmd: AA2Commands.Cancel },
          messages: [authErrorMsg],
        },
      ];
      setupAA2SDKMock(commandMessageList);

      const { AA2WorkflowHelper } = require('../workflow-helper');
      const { AA2CommandService } = require('../command-service');

      await AA2CommandService.start();

      const mockedHandler = jest.fn();
      const sub = AA2WorkflowHelper.handleError(mockedHandler);

      expect(mockedHandler.mock.calls.length).toBe(0);

      expect(await AA2CommandService.cancel()).toEqual(authErrorMsg);

      expect(mockedHandler.mock.calls.length).toBe(1);
      expect(mockedHandler.mock.calls[0][0]).toEqual(authErrorMsg);

      sub.unsubscribe();
      await AA2CommandService.stop();
    });

    test('should handle change pin errors', async () => {
      const changePinErrorMsg: ChangePin = {
        msg: AA2Messages.ChangePin,
        success: false,
        reason: FailureCodes.User_Cancelled,
      };
      const commandMessageList: CommandMessageList = [
        {
          command: { cmd: AA2Commands.Cancel },
          messages: [changePinErrorMsg],
        },
      ];
      setupAA2SDKMock(commandMessageList);

      const { AA2WorkflowHelper } = require('../workflow-helper');
      const { AA2CommandService } = require('../command-service');

      await AA2CommandService.start();

      const mockedHandler = jest.fn();
      const sub = AA2WorkflowHelper.handleError(mockedHandler);

      expect(mockedHandler.mock.calls.length).toBe(0);

      expect(await AA2CommandService.cancel()).toEqual(changePinErrorMsg);

      expect(mockedHandler.mock.calls.length).toBe(1);
      expect(mockedHandler.mock.calls[0][0]).toEqual(changePinErrorMsg);

      sub.unsubscribe();
      await AA2CommandService.stop();
    });

    test('should handle deactivated card errors', async () => {
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

      const commandMessageList: CommandMessageList = [
        {
          command: { cmd: AA2Commands.Accept },
          messages: [readerMsgError],
        },
      ];
      setupAA2SDKMock(commandMessageList);

      const { AA2WorkflowHelper } = require('../workflow-helper');
      const { AA2CommandService } = require('../command-service');

      await AA2CommandService.start();

      const mockedHandler = jest.fn();
      const sub = AA2WorkflowHelper.handleError(mockedHandler);

      expect(mockedHandler.mock.calls.length).toBe(0);

      await expect(AA2CommandService.accept()).rejects.toEqual(readerMsgError);

      expect(mockedHandler.mock.calls.length).toBe(1);
      expect(mockedHandler.mock.calls[0][0]).toEqual(readerMsgError);

      sub.unsubscribe();
      await AA2CommandService.stop();
    });

    test('should not handle error on correct message', async () => {
      const commandMessageList: CommandMessageList = [
        {
          command: { cmd: AA2Commands.Accept },
          messages: [{ msg: AA2Messages.EnterPin }],
        },
      ];
      setupAA2SDKMock(commandMessageList);

      const { AA2WorkflowHelper } = require('../workflow-helper');
      const { AA2CommandService } = require('../command-service');

      await AA2CommandService.start();

      const mockedHandler = jest.fn();
      const sub = AA2WorkflowHelper.handleError(mockedHandler);

      expect(mockedHandler.mock.calls.length).toBe(0);

      await AA2CommandService.accept();

      expect(mockedHandler.mock.calls.length).toBe(0);

      sub.unsubscribe();
      await AA2CommandService.stop();
    });
  });

  describe('readerIsAvailable', () => {
    test('should find available reader', async () => {
      const commandMessageList: CommandMessageList = [
        {
          command: { cmd: AA2Commands.GetReaderList },
          messages: [
            {
              msg: AA2Messages.ReaderList,
              readers: [
                {
                  attached: true,
                  card: null,
                  insertable: false,
                  keypad: false,
                  name: 'NFC',
                },
                {
                  attached: true,
                  card: null,
                  insertable: true,
                  keypad: true,
                  name: 'Simulator',
                },
              ],
            },
          ],
        },
      ];

      setupAA2SDKMock(commandMessageList);

      const { AA2WorkflowHelper } = require('../workflow-helper');
      const { AA2CommandService } = require('../command-service');

      await AA2CommandService.start();

      const isAvailable = await AA2WorkflowHelper.readerIsAvailable(false);
      expect(isAvailable).toBe(true);
    });

    test('should not find nfc reader', async () => {
      const commandMessageList: CommandMessageList = [
        {
          command: { cmd: AA2Commands.GetReaderList },
          messages: [
            {
              msg: AA2Messages.ReaderList,
              readers: [
                {
                  attached: true,
                  card: null,
                  insertable: true,
                  keypad: true,
                  name: 'Simulator',
                },
              ],
            },
          ],
        },
      ];

      setupAA2SDKMock(commandMessageList);

      const { AA2WorkflowHelper } = require('../workflow-helper');
      const { AA2CommandService } = require('../command-service');

      await AA2CommandService.start();

      const isAvailable = await AA2WorkflowHelper.readerIsAvailable(false);
      expect(isAvailable).toBe(false);
    });

    test('should not find simulator reader', async () => {
      const commandMessageList: CommandMessageList = [
        {
          command: { cmd: AA2Commands.GetReaderList },
          messages: [
            {
              msg: AA2Messages.ReaderList,
              readers: [
                {
                  attached: true,
                  card: null,
                  insertable: false,
                  keypad: false,
                  name: 'NFC',
                },
              ],
            },
          ],
        },
      ];

      setupAA2SDKMock(commandMessageList);

      const { AA2WorkflowHelper } = require('../workflow-helper');
      const { AA2CommandService } = require('../command-service');

      await AA2CommandService.start();

      const isAvailable = await AA2WorkflowHelper.readerIsAvailable(true);
      expect(isAvailable).toBe(false);
    });
  });

  describe('isNfcEnabled', () => {
    test('should return the correct enabled state', async () => {
      const mockSDK = setupAA2SDKMock([]);
      Platform.OS = 'android';
      mockSDK.enabled = true;
      const { AA2WorkflowHelper } = require('../workflow-helper');

      expect(await AA2WorkflowHelper.isNfcEnabled()).toBe(true);

      mockSDK.enabled = false;
      expect(await AA2WorkflowHelper.isNfcEnabled()).toBe(false);
    });

    test('should throw if Platform is not Android', async () => {
      const mockSDK = setupAA2SDKMock([]);
      mockSDK.enabled = true;
      Platform.OS = 'ios';
      const { AA2WorkflowHelper } = require('../workflow-helper');

      await expect(AA2WorkflowHelper.isNfcEnabled()).rejects.toThrow(
        'This method is only available on Android'
      );
    });
  });

  describe('openNfcSettings', () => {
    test('should return without errors', async () => {
      const mockSDK = setupAA2SDKMock([]);
      Platform.OS = 'android';
      mockSDK.enabled = true;
      const { AA2WorkflowHelper } = require('../workflow-helper');

      await AA2WorkflowHelper.openNfcSettings();
    });

    test('should throw if Platform is not Android', async () => {
      const mockSDK = setupAA2SDKMock([]);
      mockSDK.enabled = true;
      Platform.OS = 'ios';
      const { AA2WorkflowHelper } = require('../workflow-helper');

      await expect(AA2WorkflowHelper.openNfcSettings()).rejects.toThrow(
        'This method is only available on Android'
      );
    });
  });
});
