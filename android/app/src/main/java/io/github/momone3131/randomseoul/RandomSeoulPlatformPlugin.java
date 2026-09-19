package io.github.momone3131.randomseoul;

import android.content.ActivityNotFoundException;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.text.TextUtils;
import android.util.Base64;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

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

    @PluginMethod
    public void saveImage(PluginCall call) {
        String base64 = call.getString("base64");
        String requestedName = call.getString("fileName");
        if (TextUtils.isEmpty(base64)) {
            call.reject("base64 is required.", "INVALID_IMAGE");
            return;
        }

        String fileName = sanitizeFileName(requestedName);
        byte[] bytes;
        try {
            bytes = Base64.decode(base64, Base64.DEFAULT);
        } catch (IllegalArgumentException exception) {
            call.reject("Invalid base64 image data.", "INVALID_IMAGE", exception);
            return;
        }

        try {
            JSObject result = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q
                ? saveImageToMediaStore(bytes, fileName)
                : saveImageToLegacyPictures(bytes, fileName);
            call.resolve(result);
        } catch (Exception exception) {
            call.reject("Unable to save image.", "SAVE_IMAGE_FAILED", exception);
        }
    }

    private JSObject saveImageToMediaStore(byte[] bytes, String fileName) throws Exception {
        ContentResolver resolver = getContext().getContentResolver();
        ContentValues values = new ContentValues();
        values.put(MediaStore.Images.Media.DISPLAY_NAME, fileName);
        values.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
        values.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/Random Seoul");
        values.put(MediaStore.Images.Media.IS_PENDING, 1);

        Uri uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
        if (uri == null) {
            throw new IllegalStateException("MediaStore did not return a destination URI.");
        }

        boolean completed = false;
        try (OutputStream stream = resolver.openOutputStream(uri)) {
            if (stream == null) throw new IllegalStateException("Unable to open image output stream.");
            stream.write(bytes);
            stream.flush();
            completed = true;
        } finally {
            if (!completed) resolver.delete(uri, null, null);
        }

        ContentValues ready = new ContentValues();
        ready.put(MediaStore.Images.Media.IS_PENDING, 0);
        resolver.update(uri, ready, null, null);

        JSObject result = new JSObject();
        result.put("uri", uri.toString());
        result.put("fileName", fileName);
        return result;
    }

    @SuppressWarnings("deprecation")
    private JSObject saveImageToLegacyPictures(byte[] bytes, String fileName) throws Exception {
        File pictures = getContext().getExternalFilesDir(Environment.DIRECTORY_PICTURES);
        if (pictures == null) throw new IllegalStateException("Pictures directory is unavailable.");
        File directory = new File(pictures, "Random Seoul");
        if (!directory.exists() && !directory.mkdirs()) {
            throw new IllegalStateException("Unable to create image directory.");
        }

        File file = new File(directory, fileName);
        try (FileOutputStream stream = new FileOutputStream(file)) {
            stream.write(bytes);
            stream.flush();
        }
        MediaScannerConnection.scanFile(
            getContext(),
            new String[] { file.getAbsolutePath() },
            new String[] { "image/png" },
            null
        );

        JSObject result = new JSObject();
        result.put("uri", Uri.fromFile(file).toString());
        result.put("fileName", fileName);
        return result;
    }

    private String sanitizeFileName(String requestedName) {
        String fileName = TextUtils.isEmpty(requestedName)
            ? "random-seoul-visit-statistics.png"
            : requestedName.replaceAll("[^A-Za-z0-9._-]", "_");
        if (!fileName.toLowerCase().endsWith(".png")) fileName += ".png";
        return fileName;
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
