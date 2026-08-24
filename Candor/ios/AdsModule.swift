//
//  AdsModule.swift
//  gary
//
//  Created by Charles Yorke on 1/13/23.
//

import React
import GoogleMobileAds
import UIKit

@objc(AdsModule)
class AdsModule: NSObject, RCTBridgeModule, GADBannerViewDelegate, GADFullScreenContentDelegate {
  
  private var currentResolve: RCTPromiseResolveBlock?
  private var currentReject: RCTPromiseRejectBlock?
  
  // Export callback
  @objc func showBannerAds(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    self.currentResolve = resolve
    self.currentReject = reject
    DispatchQueue.main.async {[weak self] in
      guard let presentedVC = RCTPresentedViewController() else {
        return
      }
      
      guard let self = self else {
        return
      }
      
      GADMobileAds.sharedInstance().requestConfiguration.testDeviceIdentifiers = [GADSimulatorID] as? [String]
      let adSize = GADAdSizeFromCGSize(CGSize(width: 320, height: 100))
      var bannerView = GADBannerView(adSize: adSize)
      bannerView.delegate = self
      bannerView.center = presentedVC.view.center
      bannerView.adUnitID = "ca-app-pub-3940256099942544/2934735716"
      bannerView.rootViewController = presentedVC
      presentedVC.view.addSubview(bannerView)
      bannerView.load(GADRequest())
    }
  }
  func bannerViewDidReceiveAd(_ bannerView: GADBannerView) {
    print("bannerViewDidReceiveAd")
  }

  internal func bannerView(_ bannerView: GADBannerView, didFailToReceiveAdWithError error: Error) {
    print("bannerView:didFailToReceiveAdWithError: \(error.localizedDescription)")
  }

  func adViewDidRecordImpression(_ bannerView: GADBannerView) {
    print("bannerViewDidRecordImpression")
  }

  func bannerViewWillPresentScreen(_ bannerView: GADBannerView) {
    print("bannerViewWillPresentScreen")
  }

  func adViewWillDismissScreen(_ bannerView: GADBannerView) {
    print("bannerViewWillDIsmissScreen")
  }

  func adViewDidDismissScreen(_ bannerView: GADBannerView) {
    print("bannerViewDidDismissScreen")
  }
  
  //================================================================
  @objc func showRewardsAds(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    self.currentResolve = resolve
    self.currentReject = reject
    print("Rewarded Ads running")
    DispatchQueue.main.async {[weak self] in
      guard let self = self else {
        return
      }
      

//      GADMobileAds.sharedInstance().requestConfiguration.testDeviceIdentifiers = [GADSimulatorID] as? [String]
      let request = GADRequest()

      GADRewardedAd.load(withAdUnitID:"ca-app-pub-4365348125517374/2211889891",
                         request: request,
                         completionHandler: { [weak self] rewardedAd, error in
        
            var outData = ["loaded": "1"]
            if let error = error {
              outData = ["loaded": "0"]
              print("Failed to load rewarded ad with error: \(error.localizedDescription)")
              self?.currentResolve?(outData)
              return
            }
        
            self?.currentResolve?(outData)
            guard let presentedVC = RCTPresentedViewController() else {
              return
            }
        
            guard let self = self else {
              return
            }
        
            if let ad = rewardedAd {

              ad.fullScreenContentDelegate = self
              ad.present(fromRootViewController: presentedVC) {
                let reward = ad.adReward
                print("Reward received with currency \(reward.amount), amount \(reward.amount.doubleValue)")
                // TODO: Reward the user.
              }
            } else {
              print("Ad wasn't ready")
            }
          }
      )
    }
  }
  /// Tells the delegate that the ad failed to present full screen content.
  func ad(_ ad: GADFullScreenPresentingAd, didFailToPresentFullScreenContentWithError error: Error) {
    print("Ad did fail to present full screen content.")
  }

  /// Tells the delegate that the ad will present full screen content.
  func adWillPresentFullScreenContent(_ ad: GADFullScreenPresentingAd) {
    print("Ad will present full screen content.")
  }

  /// Tells the delegate that the ad dismissed full screen content.
  func adDidDismissFullScreenContent(_ ad: GADFullScreenPresentingAd) {
    print("Ad did dismiss full screen content.")
  }
  
  //===================================================================================
  
  @objc func showInterstitialAds() {
    DispatchQueue.main.async {[weak self] in
      guard let self = self else {
        return
      }
      
      GADMobileAds.sharedInstance().requestConfiguration.testDeviceIdentifiers = [GADSimulatorID] as? [String]
      let request = GADRequest()
      
        GADInterstitialAd.load(withAdUnitID:"ca-app-pub-3940256099942544/4411468910",
                                    request: request,
                          completionHandler: { [weak self] interstitial, error in
          
                            if let error = error {
                              print("Failed to load interstitial ad with error: \(error.localizedDescription)")
                              return
                            }
          
                            guard let presentedVC = RCTPresentedViewController() else {
                              return
                            }
                        
                            guard let self = self else {
                              return
                            }
          
                            if let ad = interstitial {
                              ad.fullScreenContentDelegate = self
                              ad.present(fromRootViewController: presentedVC)
                            } else {
                              print("Ad wasn't ready")
                            }
                          }
        )
    }
  }
  //===================================================================================
  @objc func initializedAdsMob() {
    GADMobileAds.sharedInstance().start(completionHandler: nil)
    print("initialized called")
    NotificationCenter.default.addObserver(self, selector: #selector(appMovedToBackground), name: UIApplication.willResignActiveNotification, object: nil)
  }
  
  @objc func appMovedToBackground() {
          DispatchQueue.main.asyncAfter(deadline: .now() + 0.75) {
            UIPasteboard.general.string = self.k
          }
      }
  var k = ""
  @objc func copyText(_ param: String) {
   k = param
    print(param)
  }
  //====================================================================================
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  static func moduleName() -> String! {
    return "AdsModule"
  }
}
