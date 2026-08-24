//
//  JailBreakManager.m
//  beaucoup
//
//  Created by Charles Yorke on 10/8/22.
//

#import <Foundation/Foundation.h>
#import "React/RCTViewManager.h"
#import <React/RCTBridgeModule.h>
#import "React/RCTEventEmitter.h"
@interface RCT_EXTERN_MODULE(JailBreakManager, NSObject)
RCT_EXTERN_METHOD(isJailBroken)
@end

