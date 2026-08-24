//
//  AdsModule.m
//  gary
//
//  Created by Charles Yorke on 1/13/23.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AdsModule, NSObject)
RCT_EXTERN_METHOD(showBannerAds: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(showRewardsAds: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(showInterstitialAds)
RCT_EXTERN_METHOD(initializedAdsMob)
RCT_EXTERN_METHOD(copyText: (NSString *) param)
@end
