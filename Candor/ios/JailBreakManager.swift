//
//  JailBreakManager.swift
//  beaucoup
//
//  Created by Charles Yorke on 10/8/22.
//

import Foundation
@objc(JailBreakManager)
class JailBreakManager : NSObject{
  
  @objc
  func isJailBroken() {
    if(UIDevice().isJailBroken){
      quit()
    } 
  }
  func quit() {
      /// Sleep for a while to let the app goes in background
      sleep(2)
      exit(0)
  }
  @objc static func requiresMainQueueSetup() -> Bool {
     return true
   }
}

