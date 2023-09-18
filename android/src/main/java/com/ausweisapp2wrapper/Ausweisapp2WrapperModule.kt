package com.ausweisapp2wrapper

import android.app.Activity
import android.app.PendingIntent
import android.content.*
import android.nfc.NfcAdapter
import android.nfc.NfcAdapter.getDefaultAdapter
import android.nfc.Tag
import android.nfc.tech.IsoDep
import android.nfc.tech.NfcA
import android.os.Build
import android.os.IBinder
import android.provider.Settings
import android.util.Log
import androidx.core.content.IntentCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.governikus.ausweisapp2.IAusweisApp2Sdk
import com.governikus.ausweisapp2.IAusweisApp2SdkCallback


class Ausweisapp2WrapperModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext), ActivityEventListener, LifecycleEventListener {

  override fun getName(): String {
    return NAME
  }

  init {
    reactApplicationContext.addActivityEventListener(this)
    reactApplicationContext.addLifecycleEventListener(this)
  }

  private var sdkConnection: ServiceConnection? = null
  private var sdk: IAusweisApp2Sdk? = null
  private var sdkSessionId: String? = null

  private val nfcAdapter: NfcAdapter? by lazy {
    getDefaultAdapter(reactApplicationContext)
  }

  private val isConnected: Boolean
    get() = sdk != null

  private val pendingIntent by lazy {
    val intent = Intent(currentActivity, currentActivity?.javaClass)
    intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      PendingIntent.getActivity(
        currentActivity,
        0,
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
      )
    } else {
      PendingIntent.getActivity(currentActivity, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT)
    }
  }

  private fun sendEvent(eventName: String, message: String?) {
    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, message)
  }

  private fun enableNFCForegroundDispatch() {
    if (sdk == null) {
      return
    }

    nfcAdapter?.enableForegroundDispatch(
      currentActivity,
      pendingIntent,
      arrayOf(IntentFilter(NfcAdapter.ACTION_TECH_DISCOVERED)),
      arrayOf(
        arrayOf<String>(
          IsoDep::class.java.name,
          NfcA::class.java.name
        )
      )
    )
  }

  private fun disableNFCForegroundDispatch() {
    try {
      nfcAdapter?.disableForegroundDispatch(currentActivity);
    } catch (e: Exception) {
      Log.d(TAG, "Could not disable foreground dispatch", e)
    }
  }

  /**
   * Initialize the AusweisApp2 SDK and starts NFC Tag foreground dispatch
   */
  @ReactMethod
  fun start() {
    if (isConnected) {
      return
    }

    val packageName = reactApplicationContext.packageName
    val serviceIntent = Intent("com.governikus.ausweisapp2.START_SERVICE")
      .setPackage(packageName)

    val sdkCallback = object : IAusweisApp2SdkCallback.Stub() {
      override fun sessionIdGenerated(sessionId: String, isSecureSessionId: Boolean) {
        this@Ausweisapp2WrapperModule.sdkSessionId = sessionId
      }

      override fun receive(messageJson: String) {
        sendEvent("message", messageJson)
      }

      override fun sdkDisconnected() {
        sdkSessionId = null
      }
    }

    sdkConnection = object : ServiceConnection {
      override fun onServiceConnected(className: ComponentName, service: IBinder) {
        try {
          sdk = IAusweisApp2Sdk.Stub.asInterface(service)
          enableNFCForegroundDispatch()
          sdk?.connectSdk(sdkCallback)
          Log.d(TAG, "Service successfully connected")
          sendEvent("connected", null)
        } catch (e: Exception) {
          Log.d(TAG, "Could not connect to SDK", e)
          sendEvent("error", e.toString())
        }
      }

      override fun onServiceDisconnected(className: ComponentName) {
        // Needed for ServiceConnection Interface
      }
    }.also {
      try {
        currentActivity?.bindService(serviceIntent, it, Context.BIND_AUTO_CREATE)
      } catch (e: Exception) {
        Log.d(TAG, "Could not bind service", e)
        sendEvent("error", e.toString())
      }
    }
  }

  /**
   * Stop the AusweisApp2 SDK (Cancels all running Workflows) and stop NFC Tag foreground dispatch
   */
  @ReactMethod
  fun stop() {
    if (!isConnected) {
      return
    }

    sdkConnection?.let {
      try {
        currentActivity?.unbindService(it)
      } catch (e: Exception) {
        Log.d(TAG, "Could not unbind service", e)
      }
    }
    sdkConnection = null
    sdk = null
    sdkSessionId = null

    disableNFCForegroundDispatch()
    sendEvent("disconnected", null)
  }

  /**
   * Send a command to the AusweisApp2 SDK encoded as a JSON String
   */
  @ReactMethod
  fun send(command: String) {
    val sdk = sdk ?: return
    val sessionId = sdkSessionId ?: return

    try {
      sdk.send(sessionId, command)
    } catch (e: Exception) {
      Log.d(TAG, "Could not send command to SDK", e)
      sendEvent("error", e.toString())
    }
  }

  /**
   * Return if AusweisApp2 SDK is running
   */
  @ReactMethod
  fun isRunning(promise: Promise) {
    promise.resolve(isConnected)
  }

  /**
   * Check if NFC is enabled. See: https://developer.android.com/reference/android/nfc/NfcAdapter#isEnabled()
   */
  @ReactMethod
  fun isNfcEnabled(promise: Promise) {
    promise.resolve(nfcAdapter?.isEnabled)
  }

  /**
   * Open NFC Settings. See: https://developer.android.com/reference/android/provider/Settings#ACTION_NFC_SETTINGS
   */
  @ReactMethod
  fun openNfcSettings(promise: Promise) {
    try {
      val intent = Intent(Settings.ACTION_NFC_SETTINGS)
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      reactApplicationContext.startActivity(intent)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject(e)
    }
  }

  @ReactMethod
  fun addListener(eventName: String) {
    // Needed for NativeEventEmitter functionality
  }

  @ReactMethod
  fun removeListeners(count: Int) {
    // Needed for NativeEventEmitter functionality
  }

  override fun invalidate() {
    stop()
  }

  override fun onHostResume() {
    enableNFCForegroundDispatch()
  }

  override fun onHostPause() {
    disableNFCForegroundDispatch()
  }

  override fun onHostDestroy() {
    // Needed for LifecycleEventListener Interface
  }

  override fun onActivityResult(p0: Activity?, p1: Int, p2: Int, p3: Intent?) {
    // Needed for ActivityEventListener Interface
  }

  /**
   * Overrides onNewIntent for ActivityEventListener and handles new NFC Tag Intents
   */
  override fun onNewIntent(intent: Intent) {
    val sdk = sdk ?: return
    val sdkSessionId = sdkSessionId ?: return
    val tag = IntentCompat.getParcelableExtra(intent, NfcAdapter.EXTRA_TAG, Tag::class.java) ?: return

    try {
      sdk.updateNfcTag(sdkSessionId, tag)
    } catch (e: Exception) {
      Log.d(TAG, "Could not send NFC Tag update to SDK", e)
    }
  }

  companion object {
    const val NAME = "Ausweisapp2Wrapper"
    private val TAG = Ausweisapp2WrapperModule::class.java.simpleName
  }
}
