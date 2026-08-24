package com.besocial.candor;

import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.OnUserEarnedRewardListener;
import com.google.android.gms.ads.RequestConfiguration;
import com.google.android.gms.ads.rewarded.RewardItem;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;

public class AdsModule extends ReactContextBaseJavaModule {
    private static final String AD_UNIT_ID = "ca-app-pub-4365348125517374/1090379910";
    boolean isLoading = false;
    private RewardedAd rewardedAdMain;
    ReactApplicationContext context = this.getReactApplicationContext();

    public AdsModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "AdsModule";
    }

    @ReactMethod
    public void initializedAdsMob(final Promise promise) {
        promise.resolve("3000");
    }

    @ReactMethod
    public void showRewardsAds(final Promise promise) {

        context.getCurrentActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (isLoading) {
                    return;
                }
                if (rewardedAdMain == null) {
                    isLoading = true;
                    // List<String> testDeviceIds =
                    // Arrays.asList("33BE2250B43518CCDA7DE426D04EE231");
                    // RequestConfiguration configuration =
                    // new RequestConfiguration.Builder().setTestDeviceIds(testDeviceIds).build();
                    // MobileAds.setRequestConfiguration(configuration);
                    AdRequest adRequest = new AdRequest.Builder().build();
                    RewardedAd.load(
                            context,
                            AD_UNIT_ID,
                            adRequest,
                            new RewardedAdLoadCallback() {
                                @Override
                                public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                                    // Log.d(TAG, loadAdError.getMessage());
                                    rewardedAdMain = null;
                                    isLoading = false;
                                    promise.resolve(" fail to load");
                                    // Toast.makeText(MainActivity.this, "onAdFailedToLoad",
                                    // Toast.LENGTH_SHORT).show();
                                }

                                @Override
                                public void onAdLoaded(@NonNull RewardedAd rewardedAd) {
                                    rewardedAdMain = rewardedAd;
                                    // Log.d(TAG, "onAdLoaded");
                                    isLoading = false;
                                    // promise.resolve("loaded");
                                    rewardedAdMain.setFullScreenContentCallback(
                                            new FullScreenContentCallback() {
                                                @Override
                                                public void onAdShowedFullScreenContent() {
                                                    // Called when ad is shown.
                                                    // Log.d(TAG, "onAdShowedFullScreenContent");
                                                    // Toast.makeText(MainActivity.this, "onAdShowedFullScreenContent",
                                                    // Toast.LENGTH_SHORT)
                                                    // .show();
                                                }

                                                @Override
                                                public void onAdFailedToShowFullScreenContent(AdError adError) {
                                                    // Called when ad fails to show.
                                                    // Log.d(TAG, "onAdFailedToShowFullScreenContent");
                                                    // Don't forget to set the ad reference to null so you
                                                    // don't show the ad a second time.
                                                    rewardedAdMain = null;
                                                    // Toast.makeText(
                                                    // MainActivity.this, "onAdFailedToShowFullScreenContent",
                                                    // Toast.LENGTH_SHORT)
                                                    // .show();
                                                }

                                                @Override
                                                public void onAdDismissedFullScreenContent() {
                                                    // Called when ad is dismissed.
                                                    // Don't forget to set the ad reference to null so you
                                                    // don't show the ad a second time.
                                                    rewardedAdMain = null;
                                                    // Log.d(TAG, "onAdDismissedFullScreenContent");
                                                    // Toast.makeText(MainActivity.this,
                                                    // "onAdDismissedFullScreenContent", Toast.LENGTH_SHORT)
                                                    // .show();
                                                    // Preload the next rewarded ad.
                                                    // MainActivity.this.loadRewardedAd();
                                                }
                                            });
                                    rewardedAdMain.show(
                                            context.getCurrentActivity(),
                                            new OnUserEarnedRewardListener() {
                                                @Override
                                                public void onUserEarnedReward(@NonNull RewardItem rewardItem) {
                                                    // Handle the reward.
                                                    // Log.d("TAG", "The user earned the reward.");
                                                    int rewardAmount = rewardItem.getAmount();
                                                    String rewardType = rewardItem.getType();
                                                }
                                            });
                                }
                            });
                }
            }
        });
    }
}
