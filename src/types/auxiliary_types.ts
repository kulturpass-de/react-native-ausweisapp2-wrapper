/**
 * Detailed description of the certificate.
 * https://www.ausweisapp.bund.de/sdk/messages.html#certificate
 */
export type CertificateDescription = {
  // Name of the certificate issuer.
  issuerName: string;
  // URL of the certificate issuer.
  issuerUrl: string;
  // Name of the certificate subject.
  subjectName: string;
  // URL of the certificate subject.
  subjectUrl: string;
  // Raw certificate information about the terms of usage.
  termsOfUsage: string;
  // Parsed purpose of the terms of usage.
  purpose: string;
};

/**
 * Validity dates of the certificate in UTC.
 * https://www.ausweisapp.bund.de/sdk/messages.html#certificate
 */
export type CertificateValidity = {
  // Certificate is valid since this date.
  effectiveDate: string;
  // Certificate is invalid after this date.
  expirationDate: string;
};

/**
 * Access Rights that can be requested for a identification flow.
 * https://www.ausweisapp.bund.de/sdk/messages.html#values
 */
export enum AccessRight {
  Address = 'Address',
  BirthName = 'BirthName',
  FamilyName = 'FamilyName',
  GivenNames = 'GivenNames',
  PlaceOfBirth = 'PlaceOfBirth',
  DateOfBirth = 'DateOfBirth',
  DoctoralDegree = 'DoctoralDegree',
  ArtisticName = 'ArtisticName',
  Pseudonym = 'Pseudonym',
  ValidUntil = 'ValidUntil',
  Nationality = 'Nationality',
  IssuingCountry = 'IssuingCountry',
  DocumentType = 'DocumentType',
  ResidencePermitI = 'ResidencePermitI',
  ResidencePermitII = 'ResidencePermitII',
  CommunityID = 'CommunityID',
  AddressVerification = 'AddressVerification',
  AgeVerification = 'AgeVerification',
  WriteAddress = 'WriteAddress',
  WriteCommunityID = 'WriteCommunityID',
  WriteResidencePermitI = 'WriteResidencePermitI',
  WriteResidencePermitII = 'WriteResidencePermitII',
  CanAllowed = 'CanAllowed',
  PinManagement = 'PinManagement',
}

/**
 * Optional auxiliary data of the provider.
 * https://www.ausweisapp.bund.de/sdk/messages.html#access-rights
 */
export type AccessRightsAuxiliaryData = {
  // Optional required date of birth for AgeVerification as ISO 8601.
  ageVerificationDate?: string;
  // Optional required age for AgeVerification. It is calculated by AusweisApp on the basis of ageVerificationDate and current date.
  requiredAge?: string;
  // Optional validity date as ISO 8601.
  validityDate?: string;
  // Optional id of community.
  communityId?: string;
};

/**
 * Access rights of the provider.
 * https://www.ausweisapp.bund.de/sdk/messages.html#access-rights
 */
export type AccessRightsChat = {
  // Indicates the enabled access rights of optional and required.
  effective: AccessRight[];
  // These rights are optional and can be enabled or disabled by SET_ACCESS_RIGHTS.
  optional: AccessRight[];
  // These rights are mandatory and cannot be disabled.
  required: AccessRight[];
};

/**
 * Provides information about inserted card, otherwise null.
 * https://www.ausweisapp.bund.de/sdk/messages.html#reader
 */
export type Card = {
  // True if PUK is inoperative and cannot unblock PIN, otherwise false. This can be recognized if user enters a correct PUK only. It is not possbible to read this data before a user tries to unblock the PIN.
  inoperative: boolean;
  // True if eID function is deactivated, otherwise false.
  deactivated: boolean;
  // Count of possible retries for the PIN. If you enter a PIN with command SET_PIN it will be decreased if PIN was incorrect.
  retryCounter: number;
};

/**
 * Information about the used card and card reader. Please see message READER for details.
 * https://www.ausweisapp.bund.de/sdk/messages.html#enter-pin
 */
export type ReaderData = {
  // Identifier of card reader.
  name: 'NFC' | 'Simulator' | string;
  // Indicates whether a card can be inserted via SET_CARD.
  insertable: boolean;
  // Indicates whether a card reader is connected or disconnected.
  attached: boolean;
  // Indicates whether a card reader has a keypad. The parameter is only shown when a reader is attached.
  keypad: boolean;
  // Provides information about inserted card, otherwise null.
  card: Card | null;
};

/**
 * Structure of version information.
 * https://www.ausweisapp.bund.de/sdk/messages.html#info
 */
export type VersionInfo = {
  // Application name.
  'Name': string;
  // Title of implementation.
  'Implementation-Title': string;
  // Vendor of implementation.
  'Implementation-Vendor': string;
  // Version of implementation.
  'Implementation-Version': string;
  // Title of specification.
  'Specification-Title': string;
  // Vendor of specification.
  'Specification-Vendor': string;
  // Version of specification.
  'Specification-Version': string;
};

/**
 * Specific data for Simulator.
 * https://www.ausweisapp.bund.de/sdk/commands.html#set-card
 * https://www.ausweisapp.bund.de/sdk/simulator.html
 */
export type Simulator = {
  /**
   * Content of card Filesystem.
   * https://www.ausweisapp.bund.de/sdk/simulator.html#filesystem
   */
  files: Array<{
    fileId: string;
    shortFileId: string;
    content: string;
  }>;
  /**
   * Keys of card Filesystem.
   * https://www.ausweisapp.bund.de/sdk/simulator.html#filesystem
   */
  keys: Array<{
    id: number;
    private: string;
  }>;
};

export type Workflow = 'AUTH' | 'CHANGE_PIN';

/**
 * Messages for the system dialog on iOS.
 * https://www.ausweisapp.bund.de/sdk/commands.html#run-auth
 * https://www.ausweisapp.bund.de/sdk/commands.html#run-change-pin
 */
export type WorkflowMessages = {
  // Shown if scanning is started.
  sessionStarted: string;
  // Shown if communication was stopped with an error.
  sessionFailed: string;
  // Shown if communication was stopped successfully.
  sessionSucceeded: string;
  // Shown if communication is in progress. This message will be appended with current percentage level.
  sessionInProgress: string;
};

/**
 * The final result of authentication.
 * https://www.ausweisapp.bund.de/sdk/messages.html#auth
 */
export type AuthResult = {
  // Major “error” code.
  major: string;
  // Minor error code.
  minor?: string;
  // Language of description and message. Language “en” is supported only at the moment.
  language?: string;
  // Description of the error message.
  description?: string;
  // The error message.
  message?: string;
  // Unique Failure Codes.
  reason?: FailureCodes;
};

/**
 * FailureCodes that indicate the reason an Auth or ChangePin workflow failed.
 * https://www.ausweisapp.bund.de/sdk/failurecodes.html
 */
export enum FailureCodes {
  User_Cancelled = 'User_Cancelled',
  Card_Removed = 'Card_Removed',
  Processing_Send_Status_Failed = 'Processing_Send_Status_Failed',
  Parse_TcToken_Invalid_Url = 'Parse_TcToken_Invalid_Url',
  Parse_TcToken_Missing_Url = 'Parse_TcToken_Missing_Url',
  Get_TcToken_Invalid_Url = 'Get_TcToken_Invalid_Url',
  Get_TcToken_Invalid_Redirect_Url = 'Get_TcToken_Invalid_Redirect_Url',
  Get_TcToken_Invalid_Certificate_Key_Length = 'Get_TcToken_Invalid_Certificate_Key_Length',
  Get_TcToken_Invalid_Ephemeral_Key_Length = 'Get_TcToken_Invalid_Ephemeral_Key_Length',
  Get_TcToken_Invalid_Server_Reply = 'Get_TcToken_Invalid_Server_Reply',
  Get_TcToken_Empty_Data = 'Get_TcToken_Empty_Data',
  Get_TcToken_Invalid_Data = 'Get_TcToken_Invalid_Data',
  Get_TcToken_Network_Error = 'Get_TcToken_Network_Error',
  Certificate_Check_Failed_No_Description = 'Certificate_Check_Failed_No_Description',
  Certificate_Check_Failed_No_SubjectUrl_In_Description = 'Certificate_Check_Failed_No_SubjectUrl_In_Description',
  Certificate_Check_Failed_Hash_Mismatch = 'Certificate_Check_Failed_Hash_Mismatch',
  Certificate_Check_Failed_Same_Origin_Policy_Violation = 'Certificate_Check_Failed_Same_Origin_Policy_Violation',
  Certificate_Check_Failed_Hash_Missing_In_Description = 'Certificate_Check_Failed_Hash_Missing_In_Description',
  Pre_Verification_No_Test_Environment = 'Pre_Verification_No_Test_Environment',
  Pre_Verification_Invalid_Certificate_Chain = 'Pre_Verification_Invalid_Certificate_Chain',
  Pre_Verification_Invalid_Certificate_Signature = 'Pre_Verification_Invalid_Certificate_Signature',
  Pre_Verification_Certificate_Expired = 'Pre_Verification_Certificate_Expired',
  Extract_Cvcs_From_Eac1_No_Unique_At = 'Extract_Cvcs_From_Eac1_No_Unique_At',
  Extract_Cvcs_From_Eac1_No_Unique_Dv = 'Extract_Cvcs_From_Eac1_No_Unique_Dv',
  Extract_Cvcs_From_Eac1_At_Missing = 'Extract_Cvcs_From_Eac1_At_Missing',
  Extract_Cvcs_From_Eac1_Dv_Missing = 'Extract_Cvcs_From_Eac1_Dv_Missing',
  Connect_Card_Connection_Failed = 'Connect_Card_Connection_Failed',
  Connect_Card_Eid_Inactive = 'Connect_Card_Eid_Inactive',
  Prepace_Pace_Smart_Eid_Invalidated = 'Prepace_Pace_Smart_Eid_Invalidated',
  Establish_Pace_Channel_No_Active_Pin = 'Establish_Pace_Channel_No_Active_Pin',
  Establish_Pace_Channel_Basic_Reader_No_Pin = 'Establish_Pace_Channel_Basic_Reader_No_Pin',
  Establish_Pace_Channel_Puk_Inoperative = 'Establish_Pace_Channel_Puk_Inoperative',
  Establish_Pace_Channel_User_Cancelled = 'Establish_Pace_Channel_User_Cancelled',
  Maintain_Card_Connection_Pace_Unrecoverable = 'Maintain_Card_Connection_Pace_Unrecoverable',
  Did_Authenticate_Eac1_Card_Command_Failed = 'Did_Authenticate_Eac1_Card_Command_Failed',
  Process_Certificates_From_Eac2_Cvc_Chain_Missing = 'Process_Certificates_From_Eac2_Cvc_Chain_Missing',
  Did_Authenticate_Eac2_Invalid_Cvc_Chain = 'Did_Authenticate_Eac2_Invalid_Cvc_Chain',
  Did_Authenticate_Eac2_Card_Command_Failed = 'Did_Authenticate_Eac2_Card_Command_Failed',
  Generic_Send_Receive_Paos_Unhandled = 'Generic_Send_Receive_Paos_Unhandled',
  Generic_Send_Receive_Network_Error = 'Generic_Send_Receive_Network_Error',
  Generic_Send_Receive_Tls_Error = 'Generic_Send_Receive_Tls_Error',
  Generic_Send_Receive_Server_Error = 'Generic_Send_Receive_Server_Error',
  Generic_Send_Receive_Client_Error = 'Generic_Send_Receive_Client_Error',
  Generic_Send_Receive_Paos_Unknown = 'Generic_Send_Receive_Paos_Unknown',
  Generic_Send_Receive_Paos_Unexpected = 'Generic_Send_Receive_Paos_Unexpected',
  Generic_Send_Receive_Invalid_Ephemeral_Key_Length = 'Generic_Send_Receive_Invalid_Ephemeral_Key_Length',
  Generic_Send_Receive_Certificate_Error = 'Generic_Send_Receive_Certificate_Error',
  Generic_Send_Receive_Session_Resumption_Failed = 'Generic_Send_Receive_Session_Resumption_Failed',
  Transmit_Card_Command_Failed = 'Transmit_Card_Command_Failed',
  Start_Paos_Response_Missing = 'Start_Paos_Response_Missing',
  Start_Paos_Response_Error = 'Start_Paos_Response_Error',
  Check_Refresh_Address_Fatal_Tls_Error_Before_Reply = 'Check_Refresh_Address_Fatal_Tls_Error_Before_Reply',
  Check_Refresh_Address_Invalid_Ephemeral_Key_Length = 'Check_Refresh_Address_Invalid_Ephemeral_Key_Length',
  Check_Refresh_Address_Service_Unavailable = 'Check_Refresh_Address_Service_Unavailable',
  Check_Refresh_Address_Service_Timeout = 'Check_Refresh_Address_Service_Timeout',
  Check_Refresh_Address_Proxy_Error = 'Check_Refresh_Address_Proxy_Error',
  Check_Refresh_Address_Fatal_Tls_Error_After_Reply = 'Check_Refresh_Address_Fatal_Tls_Error_After_Reply',
  Check_Refresh_Address_Unknown_Network_Error = 'Check_Refresh_Address_Unknown_Network_Error',
  Check_Refresh_Address_Invalid_Http_Response = 'Check_Refresh_Address_Invalid_Http_Response',
  Check_Refresh_Address_Empty = 'Check_Refresh_Address_Empty',
  Check_Refresh_Address_Invalid_Url = 'Check_Refresh_Address_Invalid_Url',
  Check_Refresh_Address_No_Https_Scheme = 'Check_Refresh_Address_No_Https_Scheme',
  Check_Refresh_Address_Fetch_Certificate_Error = 'Check_Refresh_Address_Fetch_Certificate_Error',
  Check_Refresh_Address_Unsupported_Certificate = 'Check_Refresh_Address_Unsupported_Certificate',
  Check_Refresh_Address_Hash_Missing_In_Certificate = 'Check_Refresh_Address_Hash_Missing_In_Certificate',
  Redirect_Browser_Send_Error_Page_Failed = 'Redirect_Browser_Send_Error_Page_Failed',
  Redirect_Browser_Send_Redirect_Failed = 'Redirect_Browser_Send_Redirect_Failed',
  Generic_Provider_Communication_Network_Error = 'Generic_Provider_Communication_Network_Error',
  Generic_Provider_Communication_Invalid_Ephemeral_Key_Length = 'Generic_Provider_Communication_Invalid_Ephemeral_Key_Length',
  Generic_Provider_Communication_Certificate_Error = 'Generic_Provider_Communication_Certificate_Error',
  Generic_Provider_Communication_Tls_Error = 'Generic_Provider_Communication_Tls_Error',
  Get_SelfAuthData_Invalid_Or_Empty = 'Get_SelfAuthData_Invalid_Or_Empty',
  Change_Pin_No_SetEidPinCommand_Response = 'Change_Pin_No_SetEidPinCommand_Response',
  Change_Pin_Input_Timeout = 'Change_Pin_Input_Timeout',
  Change_Pin_User_Cancelled = 'Change_Pin_User_Cancelled',
  Change_Pin_New_Pin_Mismatch = 'Change_Pin_New_Pin_Mismatch',
  Change_Pin_New_Pin_Invalid_Length = 'Change_Pin_New_Pin_Invalid_Length',
  Change_Pin_Unexpected_Transmit_Status = 'Change_Pin_Unexpected_Transmit_Status',
  Change_Pin_Card_New_Pin_Mismatch = 'Change_Pin_Card_New_Pin_Mismatch',
  Change_Pin_Card_User_Cancelled = 'Change_Pin_Card_User_Cancelled',
  Start_Ifd_Service_Failed = 'Start_Ifd_Service_Failed',
  Prepare_Pace_Ifd_Unknown = 'Prepare_Pace_Ifd_Unknown',
  Establish_Pace_Ifd_Unknown = 'Establish_Pace_Ifd_Unknown',
  Enter_Pace_Password_Ifd_User_Cancelled = 'Enter_Pace_Password_Ifd_User_Cancelled',
  Enter_New_Pace_Pin_Ifd_User_Cancelled = 'Enter_New_Pace_Pin_Ifd_User_Cancelled',
}

/**
 * Indicates the state of the connection to the AusweisApp for integrated SDK (Android only). The following states are possible.
 * https://www.ausweisapp.bund.de/sdk/messages.html#info
 */
export enum InfoAusweisApp {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  INVALID_CERTIFICATE = 'INVALID_CERTIFICATE',
  INCOMPATIBLE_VERSION = 'INCOMPATIBLE_VERSION',
  UNKNOWN = 'UNKNOWN',
}
