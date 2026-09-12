package io.github.momone3131.randomseoul;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.text.TextUtils;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "RandomSeoulPlatform")
public class RandomSeoulPlatformPlugin extends Plugin {
    @PluginMethod
    public void openUrl(PluginCall call) {
        String url = call.getString("url");
        if (TextUtils.isEmpty(url)) {
            call.reject("url is required.", "INVALID_URL");
            return;
        }

        try {
            launch(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
            call.resolve();
        } catch (Exception exception) {
            call.reject("Unable to open external URL.", "OPEN_URL_FAILED", exception);
        }
    }

    @PluginMethod
    public void openMap(PluginCall call) {
        String provider = call.getString("provider");
        String query = call.getString("query");
        if (TextUtils.isEmpty(provider) || TextUtils.isEmpty(query)) {
            call.reject("provider and query are required.", "INVALID_MAP_REQUEST");
            return;
        }

        try {
            if ("naver".equalsIgnoreCase(provider)) {
                openNaverMap(query);
            } else if ("google".equalsIgnoreCase(provider)) {
                openGoogleMap(query);
            } else {
                call.reject("Unsupported map provider.", "UNSUPPORTED_PROVIDER");
                return;
            }
            call.resolve(new JSObject());
        } catch (Exception exception) {
            call.reject("Unable to open map.", "OPEN_MAP_FAILED", exception);
        }
    }

    private void openGoogleMap(String query) {
        Uri nativeUri = Uri.parse("geo:0,0?q=" + Uri.encode(query));
        Intent nativeIntent = new Intent(Intent.ACTION_VIEW, nativeUri);
        nativeIntent.setPackage("com.google.android.apps.maps");
        try {
            launch(nativeIntent);
        } catch (ActivityNotFoundException ignored) {
            Uri fallback = Uri.parse("https://www.google.com/maps/search/?api=1&query=" + Uri.encode(query));
            launch(new Intent(Intent.ACTION_VIEW, fallback));
        }
    }

    private void openNaverMap(String query) {
        String appName = getContext().getPackageName();
        Uri nativeUri = Uri.parse(
            "nmap://search?query=" + Uri.encode(query) + "&appname=" + Uri.encode(appName)
        );
        Intent nativeIntent = new Intent(Intent.ACTION_VIEW, nativeUri);
        nativeIntent.setPackage("com.nhn.android.nmap");
        try {
            launch(nativeIntent);
        } catch (ActivityNotFoundException ignored) {
            Uri fallback = Uri.parse("https://map.naver.com/p/search/" + Uri.encode(query));
            launch(new Intent(Intent.ACTION_VIEW, fallback));
        }
    }

    private void launch(Intent intent) {
        if (getActivity() != null) {
            getActivity().startActivity(intent);
            return;
        }
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
    }
}
