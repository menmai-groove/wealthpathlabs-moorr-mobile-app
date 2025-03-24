echo "Environment Variables"
echo "  PLATFORM=$PLATFORM"
echo "  FASTLANE_ACTION=$FASTLANE_ACTION"
echo "  FASTLANE_USER=$FASTLANE_USER"

buildAndroid()
{
    # Build Android
    echo "Start building app for android"
    cd "android"
    
    fastlane "$FASTLANE_ACTION"
}

buildIOS()
{
    # Build iOS
    echo "Start building app for ios"
    cd "ios"

    fastlane "$FASTLANE_ACTION"
}

if [ "$PLATFORM" = "Android" ]
then
    buildAndroid
else
    buildIOS
fi
