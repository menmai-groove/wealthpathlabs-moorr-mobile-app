## 1. Application List
  1.1 development (for development)

  1.2 staging (for staging)

  1.3 production (for production)

## 2. Environment Modification Spec
  #### 2.1 assets

  - App icons generator tool define utils folder
  - Launchscreen Image for Android and iOS
  - Default Logo Image for Android and iOS

  #### 2.2 `app.env`
  
  Environment variable for app
  #### 2.3 android-app-name.txt

  Android App name

  #### 2.4 ios-app-name.txt

  iOS App name

  #### 2.5 android-bundle.txt

  Android Bundle ID

  #### 2.6 ios-appid.txt

  iOS App Identifier ID

  #### 2.7 Appfile_android

  Android Fastlane Appfile

  #### 2.8 Appfile_ios

  iOS Fastlane Appfile
  #### 2.9 android.fastlane.env

  Android Fastlane ENV

  #### 2.10 ios.fastlane.env

  iOS Fastlane ENV
  #### 2.11 google-services.json

  Android Firebase Google Service file
  #### 2.12 GoogleService-Info.plist

  iOS Firebase Google Service file

  #### 2.13 moorr.keystore

  Android Release Keystore. (Google Play Manage key)

  #### 2.14 app-scheme.txt

  Custom Scheme (disable now)

  #### 2.15 service_account.json

  Google Service account to automatic push app to Google Play

## 3 Build Script
  - Build script allow custom environment for Development, Staging and Production
  - specific `PROVISION_PROFILE` varible in ios.fastlane.env will request the build process to update Xcode provision to that provision. Otherwise default provision defined in codebase will be used
