#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(Ausweisapp2Wrapper, RCTEventEmitter <RCTInvalidating>)

RCT_EXTERN_METHOD(start)
RCT_EXTERN_METHOD(stop)
RCT_EXTERN_METHOD(send: (NSString *) command)
RCT_EXTERN_METHOD(isRunning: (RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(supportedEvents)

-(void)startObserving {}

-(void)stopObserving {}

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
