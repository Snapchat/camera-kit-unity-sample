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
    void invokeCameraKit(const char* const *lensGroupIds[], int lensGroupIdsLength, const char* const *launchDataKeys[], int launchDataKeysLength, const char* const *launchDataValues[], int launchDataValuesLength, char *startingLensId, int cameraMode) {
        
        NSMutableArray *lgids = [[NSMutableArray alloc] init];
        for (int i = 0; i < lensGroupIdsLength; i++) {
            NSString* groupid = [[NSString alloc] initWithCString:(const char*) lensGroupIds[i] encoding:NSUTF8StringEncoding];
            [lgids addObject:groupid];
        }
        
        NSMutableDictionary *launchParams = [[NSMutableDictionary alloc] init];
        for (int i = 0; i < launchDataKeysLength; i++) {
            NSString* key = [[NSString alloc] initWithCString:(const char*) launchDataKeys[i] encoding:NSUTF8StringEncoding];
            NSString* value = [[NSString alloc] initWithCString:(const char*) launchDataValues[i] encoding:NSUTF8StringEncoding];
            [launchParams setObject:value forKey:key];
        }
        
        NSString *lensId = [[NSString alloc] initWithCString:(const char*) startingLensId encoding:NSUTF8StringEncoding];
        NSNumber *mode = [[NSNumber alloc] initWithInt:cameraMode];
        
        
        return [api invokeCameraKitWithLensGroupId:lgids withLaunchData:launchParams withStartingLensId:lensId withCamerMode:mode];
        
    }
}
