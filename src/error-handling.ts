import { map } from 'rxjs';

import { AA2ErrorObservable } from './ausweisapp2-message-event-observables';
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
} from './types/messages';

export const BASIC_ERROR_MESSAGES = [
  AA2Messages.BadState,
  AA2Messages.InternalError,
  AA2Messages.Invalid,
  AA2Messages.UnknownCommand,
];

/**
 * Check if the Message is a Auth Message error.
 * See https://github.com/Governikus/AusweisApp2Wrapper-iOS/blob/main/card/core/WorkflowController.swift#L455
 * and https://github.com/Governikus/AusweisApp2Wrapper-iOS/blob/main/card/core/WorkflowDataExtensions.swift#L8
 */
export const isAuthError = (msg: Messages): msg is Auth => {
  return (
    msg.msg === AA2Messages.Auth &&
    (msg.error !== undefined ||
      msg.result?.major.includes('resultmajor#error') === true)
  );
};

/**
 * Check if the Message is a ChangePin Message error.
 * See https://www.ausweisapp.bund.de/sdk/messages.html#change-pin
 */
export const isChangePinError = (msg: Messages): msg is ChangePin => {
  return msg.msg === AA2Messages.ChangePin && msg.success === false;
};

/**
 * Check if the Message is a Reader Message with the deactivated property set to true on the attached Card.
 */
export const isCardDeactivated = (msg: Messages): msg is Reader => {
  return msg.msg === AA2Messages.Reader && msg.card?.deactivated === true;
};

/**
 * Check if the Message is one of the basic error Messages, that are always an indicator of something wrong happening.
 */
export const isBasicError = (
  msg: Messages
): msg is BadState | InternalError | Invalid | UnknownCommand => {
  return BASIC_ERROR_MESSAGES.includes(msg.msg);
};

export type ErrorMessages =
  | BadState
  | InternalError
  | Invalid
  | UnknownCommand
  | Auth
  | ChangePin;

/**
 * Check if the Message is an error
 */
export const isError = (msg: Messages): msg is ErrorMessages => {
  return isAuthError(msg) || isChangePinError(msg) || isBasicError(msg);
};

/**
 * Operator that can be used in an RxJS pipe to throw Messages that are errors. Includes Auth and ChangePin errors.
 */
export const throwAA2ErrorsOperator = map((msg: Messages): Messages => {
  if (isError(msg)) {
    throw msg;
  }
  return msg;
});

/**
 * Operator that can be used in an RxJS pipe to throw Messages that are basic errors. Does not include Auth and ChangePin errors.
 */
export const throwAA2BasicErrorsOperator = map((msg: Messages): Messages => {
  if (isBasicError(msg)) {
    throw msg;
  }
  return msg;
});

/**
 * Operator that can be used in an RxJS pipe to throw Reader Messages with a deactivated Card.
 */
export const throwAA2CardDeactivatedErrorOperator = map(
  (msg: Messages): Messages => {
    if (isCardDeactivated(msg)) {
      throw msg;
    }
    return msg;
  }
);

/**
 * Operator that can be used in an RxJS pipe to throw if an error occurs in the native iOS/Android.
 */
export const InternalErrorObservable = AA2ErrorObservable.pipe(
  map((internalErrorMsg) => {
    throw new Error(internalErrorMsg);
  })
);
