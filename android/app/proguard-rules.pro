# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }

# react-native-gesture-handler
-keep class com.swmansion.gesturehandler.** { *; }

# react-native-screens
-keep class com.swmansion.rnscreens.** { *; }

# react-native-video
-keep class com.brentvatne.react.** { *; }
-keep class com.google.android.exoplayer2.** { *; }

# react-native-svg
-keep class com.horcrux.svg.** { *; }

# react-native-linear-gradient
-keep class com.BV.LinearGradient.** { *; }

# react-native-vector-icons
-keep class com.oblador.vectoricons.** { *; }

# react-native-blur
-keep class com.cmcewen.blurview.** { *; }

# react-native-pager-view
-keep class com.reactnativepagerview.** { *; }
