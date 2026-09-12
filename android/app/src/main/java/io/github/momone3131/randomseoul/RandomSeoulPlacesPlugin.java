package io.github.momone3131.randomseoul;

import android.text.TextUtils;

import androidx.annotation.Nullable;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.libraries.places.api.Places;
import com.google.android.libraries.places.api.model.CircularBounds;
import com.google.android.libraries.places.api.model.Place;
import com.google.android.libraries.places.api.net.PlacesClient;
import com.google.android.libraries.places.api.net.SearchByTextRequest;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@CapacitorPlugin(name = "RandomSeoulPlaces")
public class RandomSeoulPlacesPlugin extends Plugin {
    private PlacesClient placesClient;
    private String initializationError;

    private static final List<Place.Field> PLACE_FIELDS = Arrays.asList(
        Place.Field.ID,
        Place.Field.DISPLAY_NAME,
        Place.Field.FORMATTED_ADDRESS,
        Place.Field.LOCATION,
        Place.Field.RATING,
        Place.Field.USER_RATING_COUNT,
        Place.Field.GOOGLE_MAPS_URI,
        Place.Field.PRIMARY_TYPE_DISPLAY_NAME,
        Place.Field.TYPES
    );

    @Override
    public void load() {
        super.load();
        String apiKey = BuildConfig.PLACES_API_KEY;
        if (TextUtils.isEmpty(apiKey) || "DEFAULT_API_KEY".equals(apiKey)) {
            initializationError = "Android Places API key is not configured.";
            return;
        }

        try {
            if (!Places.isInitialized()) {
                Places.initializeWithNewPlacesApiEnabled(getContext().getApplicationContext(), apiKey, Locale.KOREAN);
            }
            placesClient = Places.createClient(getContext());
        } catch (Exception exception) {
            initializationError = exception.getMessage() != null
                ? exception.getMessage()
                : "Failed to initialize Places SDK for Android.";
        }
    }

    @PluginMethod
    public void searchText(PluginCall call) {
        if (placesClient == null) {
            call.reject(initializationError != null ? initializationError : "Places SDK is unavailable.", "PLACES_NOT_CONFIGURED");
            return;
        }

        String textQuery = call.getString("textQuery");
        if (TextUtils.isEmpty(textQuery)) {
            call.reject("textQuery is required.", "INVALID_REQUEST");
            return;
        }

        Integer requestedCount = call.getInt("maxResults", 20);
        int maxResults = requestedCount == null ? 20 : Math.max(1, Math.min(20, requestedCount));
        String region = call.getString("region", "kr");

        SearchByTextRequest.Builder builder = SearchByTextRequest
            .builder(textQuery, PLACE_FIELDS)
            .setMaxResultCount(maxResults)
            .setRankPreference(SearchByTextRequest.RankPreference.RELEVANCE);

        if (!TextUtils.isEmpty(region)) {
            builder.setRegionCode(region.toUpperCase(Locale.ROOT));
        }

        JSObject center = call.getObject("center");
        Double radiusMeters = call.getDouble("radiusMeters");
        if (center != null && radiusMeters != null && radiusMeters > 0) {
            Double latitude = nullableDouble(center, "latitude");
            Double longitude = nullableDouble(center, "longitude");
            if (latitude != null && longitude != null) {
                builder.setLocationBias(
                    CircularBounds.newInstance(new LatLng(latitude, longitude), radiusMeters)
                );
            }
        }

        placesClient.searchByText(builder.build())
            .addOnSuccessListener(response -> {
                JSArray places = new JSArray();
                int rank = 0;
                for (Place place : response.getPlaces()) {
                    LatLng location = place.getLocation();
                    if (location == null) {
                        rank += 1;
                        continue;
                    }

                    JSObject item = new JSObject();
                    putIfNotNull(item, "id", place.getId());
                    putIfNotNull(item, "name", place.getDisplayName());
                    putIfNotNull(item, "category", place.getPrimaryTypeDisplayName());
                    putIfNotNull(item, "address", place.getFormattedAddress());
                    item.put("latitude", location.latitude);
                    item.put("longitude", location.longitude);
                    item.put("searchRank", rank);

                    if (place.getRating() != null) item.put("rating", place.getRating());
                    if (place.getUserRatingCount() != null) item.put("userRatingCount", place.getUserRatingCount());
                    if (place.getGoogleMapsUri() != null) item.put("mapUrl", place.getGoogleMapsUri().toString());

                    JSArray types = new JSArray();
                    List<String> placeTypes = place.getPlaceTypes();
                    if (placeTypes != null) {
                        for (String type : placeTypes) types.put(type);
                    }
                    item.put("types", types);
                    item.put("attributions", new JSArray());
                    places.put(item);
                    rank += 1;
                }

                JSObject result = new JSObject();
                result.put("places", places);
                call.resolve(result);
            })
            .addOnFailureListener(exception -> call.reject(
                exception.getMessage() != null ? exception.getMessage() : "Places Text Search failed.",
                "PLACES_SEARCH_FAILED",
                exception
            ));
    }

    private static void putIfNotNull(JSObject object, String key, @Nullable Object value) {
        if (value != null) object.put(key, value);
    }

    @Nullable
    private static Double nullableDouble(JSObject object, String key) {
        if (!object.has(key) || object.isNull(key)) return null;
        try {
            return object.getDouble(key);
        } catch (Exception ignored) {
            return null;
        }
    }
}
