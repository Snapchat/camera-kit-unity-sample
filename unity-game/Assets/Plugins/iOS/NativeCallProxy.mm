#import <Foundation/Foundation.h>
#import "NativeCallProxy.h"


@implementation FrameworkLibAPI

id<NativeCallsProtocol> api = NULL;
+(void) registerAPIforNativeCalls:(id<NativeCallsProtocol>) aApi
{
    api = aApi;
}

@end


extern "C" {
    void invokeCameraKit(char *lensId, char *groupId, const char* const *launchDataKeys[], int launchDataKeysLength, const char* const *launchDataValues[], int launchDataValuesLength, int renderMode, char *remoteApiSpecId) {
        
        NSMutableDictionary *launchParams = [[NSMutableDictionary alloc] init];
        for (int i = 0; i < launchDataKeysLength; i++) {
            NSString* key = [[NSString alloc] initWithCString:(const char*) launchDataKeys[i] encoding:NSUTF8StringEncoding];
            NSString* value = [[NSString alloc] initWithCString:(const char*) launchDataValues[i] encoding:NSUTF8StringEncoding];
            [launchParams setObject:value forKey:key];
        }
        
        NSString *nsLensId = [[NSString alloc] initWithCString:(const char*) lensId encoding:NSUTF8StringEncoding];
        NSString *nsGroupId = [[NSString alloc] initWithCString:(const char*) groupId encoding:NSUTF8StringEncoding];
        NSString *nsRemoteApiSpec = [[NSString alloc] init];
        if (remoteApiSpecId) {
            nsRemoteApiSpec = [[NSString alloc] initWithCString:(const char*) remoteApiSpecId encoding:NSUTF8StringEncoding];
        }
        NSNumber *nsRenderMode = [[NSNumber alloc] initWithInt:renderMode];
        
        return [api invokeCameraKitWithLens:nsLensId withGroupID:nsGroupId withLaunchData:launchParams withRenderMode:nsRenderMode withRemoteAPISpecId:nsRemoteApiSpec];
    }
    void updateLensState(const char* const *launchDataKeys[], int launchDataKeysLength, const char* const *launchDataValues[], int launchDataValuesLength)
    {
        NSMutableDictionary *launchParams = [[NSMutableDictionary alloc] init];
        for (int i = 0; i < launchDataKeysLength; i++) {
            NSString* key = [[NSString alloc] initWithCString:(const char*) launchDataKeys[i] encoding:NSUTF8StringEncoding];
            NSString* value = [[NSString alloc] initWithCString:(const char*) launchDataValues[i] encoding:NSUTF8StringEncoding];
            [launchParams setObject:value forKey:key];
        }
        
        return [api updateLensState:launchParams];
    }

    void dismissCameraKit()
    {
        return [api dismissCameraKit];
    }
}
