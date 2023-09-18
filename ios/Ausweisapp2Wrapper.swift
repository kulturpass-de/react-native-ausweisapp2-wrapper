import AusweisApp2
import Foundation

@objc(Ausweisapp2Wrapper)
class Ausweisapp2Wrapper: RCTEventEmitter {
  static var shared: Ausweisapp2Wrapper?

  override init() {
    super.init()
    Ausweisapp2Wrapper.shared = self
  }

  /**
   * Callback that handles Messages sent by the AusweisApp2 SDK
   */
  private var aa2Callback: AusweisApp2Callback = { (msg: UnsafePointer<CChar>?) in
    guard let msg: UnsafePointer<CChar> = msg else {
      Ausweisapp2Wrapper.shared?.sendEvent(withName: "connected", body: nil)
      return
    }

    let message = String(cString: msg)
    Ausweisapp2Wrapper.shared?.sendEvent(withName: "message", body: message)
  }

  /**
   * Initialize the AusweisApp2 SDK
   */
  @objc func start() {
    if !ausweisapp2_init(aa2Callback, nil) {
      Ausweisapp2Wrapper.shared?.sendEvent(withName: "error", body: nil)
    }
  }

  /**
   * Stop the AusweisApp2 SDK (Cancels all running Workflows)
   */
  @objc func stop() {
    ausweisapp2_shutdown()
    Ausweisapp2Wrapper.shared?.sendEvent(withName: "disconnected", body: nil)
  }

  /**
   * Send a command to the AusweisApp2 SDK encoded as a JSON String
   */
  @objc func send(_ command: String) {
    ausweisapp2_send(command)
  }

  /**
   * Return if AusweisApp2 SDK is running
   */
    @objc func isRunning(_ resolve: @escaping RCTPromiseResolveBlock,
                         rejecter reject: @escaping RCTPromiseRejectBlock ) {
    resolve(ausweisapp2_is_running())
  }

    override func invalidate() {
        stop()
    }

  /**
   * Supported event types by the NativeEventEmitter
   */
  override func supportedEvents() -> [String]! {
    return ["message", "connected", "error", "disconnected"]
  }
}
