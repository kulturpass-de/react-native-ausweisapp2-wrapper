import { Card, FailureCodes } from '../types/auxiliary_types';
import {
  AA2Messages,
  Auth,
  BadState,
  ChangePin,
  InternalError,
  Invalid,
  Messages,
  Reader,
  UnknownCommand,
} from '../types/messages';
import { setupAA2SDKMock } from './utils/mocked-ausweisapp2-sdk';
import { TimeoutError } from 'rxjs';

describe('Error Handling', () => {
  beforeAll(() => {
    setupAA2SDKMock([]);
  });

  test('isAuthError', () => {
    const successfulAuth: Auth = {
      msg: AA2Messages.Auth,
      result: {
        major: 'http://www.bsi.bund.de/ecard/api/1.1/resultmajor#ok',
      },
      url: 'https://test.governikus-eid.de/DEMO/?refID=123456',
    };

    const isAuthError = require('../error-handling').isAuthError;

    expect(isAuthError(successfulAuth)).toBe(false);

    const emptyAuth: Auth = {
      msg: AA2Messages.Auth,
    };

    expect(isAuthError(emptyAuth)).toBe(false);

    const unsuccessfulAuth: Auth = {
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

    expect(isAuthError(unsuccessfulAuth)).toBe(true);

    const otherMessage: Messages = {
      msg: AA2Messages.EnterPin,
      reader: {
        attached: true,
        card: {
          inoperative: false,
          deactivated: false,
          retryCounter: 3,
        },
        insertable: true,
        keypad: false,
        name: 'NFC',
      },
    };

    expect(isAuthError(otherMessage)).toBe(false);
  });

  test('isChangePinError', () => {
    const successfulChangePin: ChangePin = {
      msg: AA2Messages.ChangePin,
      success: true,
    };

    const isChangePinError = require('../error-handling').isChangePinError;

    expect(isChangePinError(successfulChangePin)).toBe(false);

    const emptyChangePin: ChangePin = {
      msg: AA2Messages.ChangePin,
    };

    expect(isChangePinError(emptyChangePin)).toBe(false);

    const unsuccessfulChangePin: ChangePin = {
      msg: AA2Messages.ChangePin,
      success: false,
      reason: FailureCodes.Change_Pin_Card_New_Pin_Mismatch,
    };

    expect(isChangePinError(unsuccessfulChangePin)).toBe(true);

    const otherMessage: Messages = {
      msg: AA2Messages.EnterPin,
      reader: {
        attached: true,
        card: {
          inoperative: false,
          deactivated: false,
          retryCounter: 3,
        },
        insertable: true,
        keypad: false,
        name: 'NFC',
      },
    };

    expect(isChangePinError(otherMessage)).toBe(false);
  });

  test('isBasicError', () => {
    const invalid: Invalid = {
      msg: AA2Messages.Invalid,
      error: 'test error',
    };

    const isBasicError = require('../error-handling').isBasicError;

    expect(isBasicError(invalid)).toBe(true);

    const badState: BadState = {
      msg: AA2Messages.BadState,
      error: 'test error',
    };
    expect(isBasicError(badState)).toBe(true);

    const internalError: InternalError = {
      msg: AA2Messages.InternalError,
      error: 'test error',
    };
    expect(isBasicError(internalError)).toBe(true);

    const unknownCommand: UnknownCommand = {
      msg: AA2Messages.UnknownCommand,
      error: 'test error',
    };
    expect(isBasicError(unknownCommand)).toBe(true);

    const otherMessage: Messages = {
      msg: AA2Messages.EnterPin,
      reader: {
        attached: true,
        card: {
          inoperative: false,
          deactivated: false,
          retryCounter: 3,
        },
        insertable: true,
        keypad: false,
        name: 'NFC',
      },
    };

    expect(isBasicError(otherMessage)).toBe(false);
  });

  test('isReaderMessageWithDeactivatedCard', () => {
    const activeCard: Reader = {
      attached: true,
      card: {
        deactivated: false,
        inoperative: false,
        retryCounter: 3,
      },
      insertable: false,
      keypad: false,
      msg: AA2Messages.Reader,
      name: 'NFC',
    };

    const isReaderMessageWithDeactivatedCard =
      require('../error-handling').isReaderMessageWithDeactivatedCard;

    expect(isReaderMessageWithDeactivatedCard(activeCard)).toBe(false);

    const inactiveCard: Reader = {
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
    expect(isReaderMessageWithDeactivatedCard(inactiveCard)).toBe(true);

    const noCard: Reader = {
      attached: true,
      card: null,
      insertable: true,
      keypad: true,
      msg: AA2Messages.Reader,
      name: 'Simulator',
    };
    expect(isReaderMessageWithDeactivatedCard(noCard)).toBe(false);

    const unknownCard: Reader = {
      attached: true,
      card: {},
      insertable: true,
      keypad: true,
      msg: AA2Messages.Reader,
      name: 'Simulator',
    };
    expect(isReaderMessageWithDeactivatedCard(unknownCard)).toBe(false);

    const otherMessage: Messages = {
      msg: AA2Messages.EnterPin,
      reader: {
        attached: true,
        card: {
          inoperative: false,
          deactivated: false,
          retryCounter: 3,
        },
        insertable: true,
        keypad: false,
        name: 'NFC',
      },
    };

    expect(isReaderMessageWithDeactivatedCard(otherMessage)).toBe(false);
  });

  test('isCardDeactivated', () => {
    const activeCard: Card = {
      deactivated: false,
      inoperative: false,
      retryCounter: 3,
    };
    const isCardDeactivated = require('../error-handling').isCardDeactivated;

    expect(isCardDeactivated(activeCard)).toBe(false);

    const inactiveCard: Card = {
      deactivated: true,
      inoperative: false,
      retryCounter: 0,
    };

    expect(isCardDeactivated(inactiveCard)).toBe(true);

    const noCard = null;
    expect(isCardDeactivated(noCard)).toBe(false);

    const unknownCard: {} = {};

    expect(isCardDeactivated(unknownCard)).toBe(false);
  });

  test('isCardUnknown', () => {
    const isCardUnknown = require('../error-handling').isCardUnknown;

    const unknownCard: Reader = {
      attached: true,
      card: {},
      insertable: false,
      keypad: false,
      msg: AA2Messages.Reader,
      name: 'NFC',
    };

    expect(isCardUnknown(unknownCard)).toBe(true);

    const activeCard: Reader = {
      attached: true,
      card: {
        deactivated: false,
        inoperative: false,
        retryCounter: 3,
      },
      insertable: false,
      keypad: false,
      msg: AA2Messages.Reader,
      name: 'NFC',
    };

    expect(isCardUnknown(activeCard)).toBe(false);

    const inactiveCard: Reader = {
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
    expect(isCardUnknown(inactiveCard)).toBe(false);

    const noCard: Reader = {
      attached: true,
      card: null,
      insertable: true,
      keypad: true,
      msg: AA2Messages.Reader,
      name: 'Simulator',
    };
    expect(isCardUnknown(noCard)).toBe(false);

    const otherMessage: Messages = {
      msg: AA2Messages.EnterPin,
      reader: {
        attached: true,
        card: {
          inoperative: false,
          deactivated: false,
          retryCounter: 3,
        },
        insertable: true,
        keypad: false,
        name: 'NFC',
      },
    };

    expect(isCardUnknown(otherMessage)).toBe(false);
  });

  test('isTimeoutError', () => {
    const isTimeoutError = require('../error-handling').isTimeoutError;

    const timeoutError = new TimeoutError();
    expect(isTimeoutError(timeoutError)).toBe(true);

    const genericError = new Error('Generic error');
    expect(isTimeoutError(genericError)).toBe(false);
  });
});
