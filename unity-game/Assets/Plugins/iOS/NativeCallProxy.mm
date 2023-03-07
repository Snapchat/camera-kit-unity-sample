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
    void invokeCameraKitWithLensGroups(const char* const *lensGroupIds[], int lensGroupIdsLength, char *startingLensId, int cameraMode, char *remoteApiSpecId) {
        NSMutableArray *lgids = [[NSMutableArray alloc] init];
        for (int i = 0; i < lensGroupIdsLength; i++) {
            NSString* groupid = [[NSString alloc] initWithCString:(const char*) lensGroupIds[i] encoding:NSUTF8StringEncoding];
            [lgids addObject:groupid];
        }
        NSString *lensId = [[NSString alloc] initWithCString:(const char*) startingLensId encoding:NSUTF8StringEncoding];
        NSString *remoteApi = [[NSString alloc] initWithCString:(const char*) remoteApiSpecId encoding:NSUTF8StringEncoding];
        NSNumber *mode = [[NSNumber alloc] initWithInt:cameraMode];
        
        return [api invokeCameraKitWithLensGroupIds:lgids withStartingLensId:lensId withCamerMode:mode withRemoteAPISpecId:remoteApi];
        
    }
    void invokeCameraKitWithSingleLens(char *startingLensId, char *groupId, const char* const *launchDataKeys[], int launchDataKeysLength, const char* const *launchDataValues[], int launchDataValuesLength, int cameraMode, char *remoteApiSpecId) {
        
        NSMutableDictionary *launchParams = [[NSMutableDictionary alloc] init];
        for (int i = 0; i < launchDataKeysLength; i++) {
            NSString* key = [[NSString alloc] initWithCString:(const char*) launchDataKeys[i] encoding:NSUTF8StringEncoding];
            NSString* value = [[NSString alloc] initWithCString:(const char*) launchDataValues[i] encoding:NSUTF8StringEncoding];
            [launchParams setObject:value forKey:key];
        }
        
        NSString *lensId = [[NSString alloc] initWithCString:(const char*) startingLensId encoding:NSUTF8StringEncoding];
        NSString *gpid = [[NSString alloc] initWithCString:(const char*) groupId encoding:NSUTF8StringEncoding];
        NSString *remoteApi = [[NSString alloc] initWithCString:(const char*) remoteApiSpecId encoding:NSUTF8StringEncoding];
        NSNumber *mode = [[NSNumber alloc] initWithInt:cameraMode];
        
        return [api invokeCameraKitWithSingleLens:lensId withGroupID:gpid withLaunchData:launchParams withCamerMode:mode withRemoteAPISpecId:remoteApi];
        
    }
    void updateLensParams(char *lensId, const char* const *launchDataKeys[], int launchDataKeysLength, const char* const *launchDataValues[], int launchDataValuesLength)
    {
        NSString *lid = [[NSString alloc] initWithCString:(const char*) lensId encoding:NSUTF8StringEncoding];
        
        NSMutableDictionary *launchParams = [[NSMutableDictionary alloc] init];
        for (int i = 0; i < launchDataKeysLength; i++) {
            NSString* key = [[NSString alloc] initWithCString:(const char*) launchDataKeys[i] encoding:NSUTF8StringEncoding];
            NSString* value = [[NSString alloc] initWithCString:(const char*) launchDataValues[i] encoding:NSUTF8StringEncoding];
            [launchParams setObject:value forKey:key];
        }
        
        return [api updateLensParams:lid withLaunchData:launchParams];
    }

    void dismissCameraKit()
    {
        return [api dismissCameraKit];
    }
}
