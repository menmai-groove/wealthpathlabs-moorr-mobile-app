LAUNCH_SCREEN_BG="splash_screen_background"
LAUNCH_SCREEN_LOGO="bootsplash_logo"
DEFAULT_PRODUCT_NAME="Moorr"
DEFAULT_IOS_APP_ID="com.moorr.ios.dev"
DEFAULT_ANDROID_APP_ID="com.moorr.android.dev"
DEFAULT_ANDROID_BUNDLE_PATH="com/moorr/android/dev"
DEFAULT_APP_FOLDER="mywealth-app"
IOS_IMAGESET_1="ImageBackgroundSplash.imageset"
IOS_IMAGESET_2="BootSplashLogo.imageset"
ENVIRONMENT_PATH=""

if [ "$DEPLOYMENT_TARGET" = "Production" ]; then 
    ENVIRONMENT_PATH="versions/production"
elif [ "$DEPLOYMENT_TARGET" = "Staging" ]; then 
    ENVIRONMENT_PATH="versions/staging"
else
    ENVIRONMENT_PATH="versions/development"
fi

copyResources() {
    echo "Copying resouces"

    # update android assets
    \cp -rf "$ENVIRONMENT_PATH/assets/android/mipmap-hdpi" "android/app/src/main/res"
    \cp -rf "$ENVIRONMENT_PATH/assets/android/mipmap-mdpi" "android/app/src/main/res"
    \cp -rf "$ENVIRONMENT_PATH/assets/android/mipmap-xhdpi" "android/app/src/main/res"
    \cp -rf "$ENVIRONMENT_PATH/assets/android/mipmap-xxhdpi" "android/app/src/main/res"
    \cp -rf "$ENVIRONMENT_PATH/assets/android/mipmap-xxxhdpi" "android/app/src/main/res"

    # update ios assets
    \cp -rf "$ENVIRONMENT_PATH/assets/ios/AppIcon.appiconset/" "ios/$DEFAULT_APP_FOLDER/Images.xcassets/AppIcon.appiconset"
    \cp -rf "$ENVIRONMENT_PATH/assets/ios/images/$LAUNCH_SCREEN_BG.png" "ios/$DEFAULT_APP_FOLDER/Images.xcassets/$IOS_IMAGESET_1/$LAUNCH_SCREEN_BG.png"
    \cp -rf "$ENVIRONMENT_PATH/assets/ios/images/$LAUNCH_SCREEN_BG@2x.png" "ios/$DEFAULT_APP_FOLDER/Images.xcassets/$IOS_IMAGESET_1/$LAUNCH_SCREEN_BG@2x.png"
    \cp -rf "$ENVIRONMENT_PATH/assets/ios/images/$LAUNCH_SCREEN_BG@3x.png" "ios/$DEFAULT_APP_FOLDER/Images.xcassets/$IOS_IMAGESET_1/$LAUNCH_SCREEN_BG@3x.png"

    if [ ! "$IOS_IMAGESET_2" = "" ] && [ -d "ios/$DEFAULT_APP_FOLDER/Images.xcassets/$IOS_IMAGESET_2" ]; then
        echo "Copy asset to $IOS_IMAGESET_2"
        \cp -rf "$ENVIRONMENT_PATH/assets/ios/images/$LAUNCH_SCREEN_LOGO.png" "ios/$DEFAULT_APP_FOLDER/Images.xcassets/$IOS_IMAGESET_2/$LAUNCH_SCREEN_LOGO.png"
        \cp -rf "$ENVIRONMENT_PATH/assets/ios/images/$LAUNCH_SCREEN_LOGO@2x.png" "ios/$DEFAULT_APP_FOLDER/Images.xcassets/$IOS_IMAGESET_2/$LAUNCH_SCREEN_LOGO@2x.png"
        \cp -rf "$ENVIRONMENT_PATH/assets/ios/images/$LAUNCH_SCREEN_LOGO@3x.png" "ios/$DEFAULT_APP_FOLDER/Images.xcassets/$IOS_IMAGESET_2/$LAUNCH_SCREEN_LOGO@3x.png"
    fi
}

copyInsensitiveData() {
    echo "Copying insensitive data"
    # update environment
    \cp -rf "$ENVIRONMENT_PATH/app.env" ".env"

    # update fastlane/.env
    \cp -rf "$ENVIRONMENT_PATH/ios.fastlane.env" "ios/fastlane/.env"
    \cp -rf "$ENVIRONMENT_PATH/android.fastlane.env" "android/fastlane/.env"

    # update fastlane Appfile
    \cp -rf "$ENVIRONMENT_PATH/Appfile_android" "android/fastlane/Appfile"
    \cp -rf "$ENVIRONMENT_PATH/Appfile_ios" "ios/fastlane/Appfile"
}

copySensitiveData() {
    echo "Copying sensitive data"
    bash ./.build-scripts/decrypt.sh "$ENCRYPTED_KEY" "$ENVIRONMENT_PATH/google-services.json.encrypt" "android/app/google-services.json"
    bash ./.build-scripts/decrypt.sh "$ENCRYPTED_KEY" "$ENVIRONMENT_PATH/GoogleService-Info.plist.encrypt" "ios/GoogleService-Info.plist"

    bash ./.build-scripts/decrypt.sh "$ENCRYPTED_KEY" "$ENVIRONMENT_PATH/moorr.keystore.encrypt" "android/app/moorr.keystore"
    bash ./.build-scripts/decrypt.sh "$ENCRYPTED_KEY" "$ENVIRONMENT_PATH/service_account.json.encrypt" "android/fastlane/service_account.json"

    bash ./.build-scripts/decrypt.sh "$ENCRYPTED_KEY" "$ENVIRONMENT_PATH/distribution.mobileprovision.encrypt" "ios/fastlane/distribution.mobileprovision"
    bash ./.build-scripts/decrypt.sh "$ENCRYPTED_KEY" "$ENVIRONMENT_PATH/distribution.p12.encrypt" "ios/fastlane/distribution.p12"

    bash ./.build-scripts/decrypt.sh "$ENCRYPTED_KEY" "$ENVIRONMENT_PATH/codepush-private.pem.encrypt" "codepush-private.pem"
    bash ./.build-scripts/decrypt.sh "$ENCRYPTED_KEY" "$ENVIRONMENT_PATH/codepush-public.pem.encrypt" "codepush-public.pem"

    bash ./.build-scripts/decrypt.sh "$ENCRYPTED_KEY" "$ENVIRONMENT_PATH/facebooksdk.txt.encrypt" "facebooksdk.txt"
}

updateAppBundle() {
    echo "Updating app id"
    # update android app bundle
    ANDROID_APP_BUNDLE=`cat $ENVIRONMENT_PATH/android-bundle.txt`
    ANDROID_APP_NAME=`cat $ENVIRONMENT_PATH/android-app-name.txt`
    NEW_BUNDLE_PATH=${ANDROID_APP_BUNDLE//./$'/'}

    if [ ! "$ANDROID_APP_BUNDLE" = "$DEFAULT_ANDROID_APP_ID" ]; then
        mkdir -p "android/app/src/main/java/$NEW_BUNDLE_PATH"
        cp -a "android/app/src/main/java/$DEFAULT_ANDROID_BUNDLE_PATH/." "android/app/src/main/java/$NEW_BUNDLE_PATH"
        rm -rf "android/app/src/main/java/$DEFAULT_ANDROID_BUNDLE_PATH/"
        LC_ALL=C find "android/app" -type f -exec perl -pi -e "s/$DEFAULT_ANDROID_APP_ID/$ANDROID_APP_BUNDLE/g" {} +
    fi
    perl -pi -e "s/$DEFAULT_PRODUCT_NAME/$ANDROID_APP_NAME/g" "android/app/src/main/res/values/strings.xml"

    # update ios app bundle
    IOS_APP_BUNDLE=`cat $ENVIRONMENT_PATH/ios-appid.txt`
    IOS_APP_DISPLAYNAME=`cat $ENVIRONMENT_PATH/ios-app-name.txt`

    if [ ! "$IOS_APP_BUNDLE" = "$DEFAULT_IOS_APP_ID" ]; then
        LC_ALL=C find "ios/" -type f -exec perl -pi -e "s/$DEFAULT_IOS_APP_ID/$IOS_APP_BUNDLE/g" {} +
    fi
    perl -pi -e "s/$DEFAULT_PRODUCT_NAME/$IOS_APP_DISPLAYNAME/g" "ios/$DEFAULT_APP_FOLDER/Info.plist"
    perl -pi -e "s/$DEFAULT_PRODUCT_NAME/$IOS_APP_DISPLAYNAME/g" "ios/$DEFAULT_APP_FOLDER.xcodeproj/project.pbxproj"
}

setupCodePush(){
    CODEPUSH_PUBLIC_KEY=`cat codepush-public.pem`
    KEY="$CODEPUSH_PUBLIC_KEY" perl -pi -e 's/CODEPUSH_PUBLIC_KEY/$ENV{KEY}/g' "android/app/src/main/res/values/strings.xml"
    KEY="$CODEPUSH_PUBLIC_KEY" perl -pi -e 's/CODEPUSH_PUBLIC_KEY/$ENV{KEY}/g' "ios/mywealth-app/Info.plist"
 
    pwd
    file="facebooksdk.txt"
    while IFS='=' read -r key value; do
    case $key in
        FACEBOOK_APP_ID)
        FACEBOOK_APP_ID=$value
        KEY="$FACEBOOK_APP_ID" perl -pi -e 's/FACEBOOK_APP_ID/$ENV{KEY}/g' "android/app/src/main/res/values/strings.xml"
        KEY="$FACEBOOK_APP_ID" perl -pi -e 's/FACEBOOK_APP_ID/$ENV{KEY}/g' "ios/mywealth-app/Info.plist"
        ;;
        FACEBOOK_CLIENT_TOKEN)
        FACEBOOK_CLIENT_TOKEN=$value
        KEY="$FACEBOOK_CLIENT_TOKEN" perl -pi -e 's/FACEBOOK_CLIENT_TOKEN/$ENV{KEY}/g' "android/app/src/main/res/values/strings.xml"
        KEY="$FACEBOOK_CLIENT_TOKEN" perl -pi -e 's/FACEBOOK_CLIENT_TOKEN/$ENV{KEY}/g' "ios/mywealth-app/Info.plist"
        ;;
        FACEBOOK_DISPLAY_NAME)
        FACEBOOK_DISPLAY_NAME=$value
        KEY="$FACEBOOK_DISPLAY_NAME" perl -pi -e 's/FACEBOOK_DISPLAY_NAME/$ENV{KEY}/g' "android/app/src/main/res/values/strings.xml"
        KEY="$FACEBOOK_DISPLAY_NAME" perl -pi -e 's/FACEBOOK_DISPLAY_NAME/$ENV{KEY}/g' "ios/mywealth-app/Info.plist"
        ;;
        *)
        echo "Warning: Unknown key found: $key"
        ;;
    esac
    done < "$file"
}

if [ ! "$ENVIRONMENT_PATH" = "" ]; then
    copyResources
    copyInsensitiveData
    copySensitiveData
    updateAppBundle
    setupCodePush
fi
