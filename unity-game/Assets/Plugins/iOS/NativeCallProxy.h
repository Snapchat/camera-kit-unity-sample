// [!] important set UnityFramework in Target Membership for this file
// [!]           and set Public header visibility

#import <Foundation/Foundation.h>

// NativeCallsProtocol defines protocol with methods you want to be called from managed
@protocol NativeCallsProtocol
@required
- (void) invokeCameraKitWithLensGroupIds:(NSArray<NSString*>*)lensGroupIDs withStartingLensId:(NSString*) lensId withCamerMode:(NSNumber*) cameraMode withRemoteAPISpecId:(NSString*) remoteApiSpecId;
- (void) invokeCameraKitWithSingleLens: (NSString*) lensId withGroupID: (NSString*) groupId withLaunchData:(NSDictionary<NSString*,NSString*>*) launchData withCamerMode:(NSNumber*) cameraMode withRemoteAPISpecId:(NSString*) remoteApiSpecId;
@end

__attribute__ ((visibility("default")))
@interface FrameworkLibAPI : NSObject
// call it any time after UnityFrameworkLoad to set object implementing NativeCallsProtocol methods
+(void) registerAPIforNativeCalls:(id<NativeCallsProtocol>) aApi;

@end


