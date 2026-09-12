package io.github.momone3131.randomseoul;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(RandomSeoulPlacesPlugin.class);
        registerPlugin(RandomSeoulPlatformPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
