package com.besocial.candor;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.scottyab.rootbeer.RootBeer;

public class JailbreakModule extends ReactContextBaseJavaModule {
    ReactApplicationContext context =  this.getReactApplicationContext();
    public JailbreakModule(@NonNull ReactApplicationContext reactContext){
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "JailBreakManager";
    }

    @ReactMethod
    public void isJailBroken() {
       RootBeer rootBeer =  new RootBeer(context);
        if (rootBeer.isRooted()) {
            android.os.Process.killProcess(android.os.Process.myPid());
        }
    }
}
