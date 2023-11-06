<p align="center">
    <img src="https://github.com/kulturpass-de/.github/blob/main/images/kulturpass-de-logo.jpg?raw=true">
<p>
<h1 align="center">
KulturPass: react-native-ausweisapp2-wrapper
</h1>
<p align="center">
<a href="https://github.com/kulturpass-de/react-native-ausweisapp2-wrapper/issues" title="Issues"><img src="https://img.shields.io/github/issues/kulturpass-de/react-native-ausweisapp2-wrapper?style=flat"></a>
<a href="https://github.com/kulturpass-de/react-native-ausweisapp2-wrapper/blob/HEAD/LICENSE" title="LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-green.svg?style=flat"></a>
<a href="https://api.reuse.software/info/github.com/kulturpass-de/react-native-ausweisapp2-wrapper" title="REUSE status"><img src="https://api.reuse.software/badge/github.com/kulturpass-de/react-native-ausweisapp2-wrapper"></a>
</p>

<p align="center">
  <a href="#about-this-project">About this Project</a> •
  <a href="#requirements">Requirements</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#usage">Usage</a> •
  <a href="#support-feedback-contributing">Support, Feedback, Contributing</a> •
  <a href="#code-of-conduct">Code of Conduct</a> •
  <a href="#licensing">Licensing</a>
</p>

## About this project

This library wraps and asyncifies the [AusweisApp2 SDK by Governikus](https://github.com/Governikus/AusweisApp2) and enables react-native apps to support eID verification of German documents with NFC. The communication with the SDK is done by sending ['Commands'](https://www.ausweisapp.bund.de/sdk/commands.html) and reacting to ['Messages'](https://www.ausweisapp.bund.de/sdk/messages.html). To orchestrate and simplify the API with the SDK through async functions, RxJS is used as a core driver of this library.

## Requirements

To use this library, at least the following requirements have to be fulfilled:

- iOS 13.0
- Android 7 and SDK version 24

## Getting Started

To add the library to your project, do the following:

1. Add react-native-ausweisapp2-wrapper to your project
```
$ yarn add react-native-ausweisapp2-wrapper
```
2. Prepare Cocoapod dependency
```
$ pod install
```

### Android

1. Add the following to your android/app/build.gradle:
```groovy
android {
  ...
  defaultConfig {
    ...
    packagingOptions {
        // Fixes build error: 2 files found with path 'lib/arm64-v8a/libc++_shared.so'
        pickFirst "lib/arm64-v8a/libc++_shared.so"
        // Needed for aab (Android App Bundle) creation.
        // The AusweisApp2 SDK will not work correctly without it
        // See also https://www.ausweisapp.bund.de/sdk/android.html#app-bundle
        jniLibs { useLegacyPackaging = true }
    }
```
See also https://www.ausweisapp.bund.de/sdk/android.html#app-bundle

The current AA2 SDK supports only 64-bit devices. The AA2 SDK does not work with 32-bit devices like the Samsung A13. Using the SDK on these devices leads to the error `com.governikus.ausweisapp2.AidlBinder.resetValidSessionID`

2. Add those lines to your android/app/src/main/AndroidManifest.xml:

```xml
<manifest ... >
  <uses-permission android:name="android.permission.NFC"/>
  <uses-feature android:name="android.hardware.nfc" android:required="false" />
...
```
See also https://developer.android.com/guide/topics/connectivity/nfc/nfc#manifest

### iOS
1. Add the following lines to your ios/cultureapp/Info.plist:
```xml
<key>com.apple.developer.nfc.readersession.iso7816.select-identifiers</key>
<array>
  <string>E80704007F00070302</string>
</array>

<key>NFCReaderUsageDescription</key>
<string>AusweisApp2 needs NFC to access the ID card.</string>
```
See also https://www.ausweisapp.bund.de/sdk/ios.html#info-plist

2. Add an entitlement file to your app, with the following content or enable the Near Field Communication Tag Reading capability in Xcode.
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>com.apple.developer.nfc.readersession.formats</key>
    <array>
      <string>TAG</string>
    </array>
  </dict>
</plist>
```
See also https://www.ausweisapp.bund.de/sdk/ios.html#entitlements and https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_developer_nfc_readersession_formats

## Usage

There are two main components used for interacting with the SDK. The _CommandService_, is used for basic functionality, such as starting and stopping the SDK and sending Commands to it. The _WorkflowHelper_, handles abstractions for the general identification workflow and adds other functionality that is not provided by the SDK (i.e. checking if NFC is enabled on Android).

### Start SDK

To start the SDK, `CommandService.start` has to be called. To initialize the SDK and setup logging in one step, the `WorkflowHelper.initializeAA2Sdk` function is used.

Example:

```typescript
WorkflowHelper.initializeAA2Sdk(true, 2)
```

### Stop SDK
Stopping the SDK and NFC capability is done by calling the `CommandService.stop` method. This is also done when the application is reloaded by metro.

### Send a Command to the SDK

With the `CommandService` Commands can be sent to the SDK. Commands that expect a Message as a response, are async functions that can be awaited.

Example:

```typescript
async () {
  const info = await CommandService.getInfo()
  return info
}
```
In this case, we return the Info Message that will be sent as a reply by the AusweisApp2 SDK.

Some Commands need additional data to be sent to the SDK. The data is always provided using parameters.

```typescript
async () {
  const reader = await CommandService.getReader("NFC")
  return reader
}
```

Optionally each command supports providing an options object as the last parameter that is used to configure the command. Currently only a milliseconds timeout is supported via `msTimeout`. This timeout is used for the maximum time that an async function waits for its Message response. If no Message response is provided in that time, a `TimeoutError` is thrown.

For examples on how to a basic identification flow works, have a look at https://www.ausweisapp.bund.de/sdk/workflow.html

Example of the wrapper usage you can find here:
https://github.com/kulturpass-de/kulturpass-app/blob/main/src/features/eid-verification/services/eid-ausweisapp2-service.ts

## Support, Feedback, Contributing

This project is open to feature requests/suggestions, bug reports etc. via [GitHub issues](https://github.com/kulturpass-de/react-native-ausweisapp2-wrapper/issues). Contribution and feedback are encouraged and always welcome. For more information about how to contribute, the project structure, as well as additional contribution information, see our [Contribution Guidelines](CONTRIBUTING.md).

## Code of Conduct

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone. By participating in this project, you agree to abide by its [Code of Conduct](CODE_OF_CONDUCT.md) at all times.

## Licensing

Copyright 2023 SAP SE or an SAP affiliate company and kulturpass-app contributors. Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/kulturpass-de/kulturpass-app).
