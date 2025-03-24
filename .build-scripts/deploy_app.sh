

# RESET BRANCH SOURCE
git add -A
git reset --hard
git pull

# ENVIROMENT VARIABLES
set -a # turn on set export
source ./.build-scripts/.env
set +a # turn on set export

# COPY CONFIGS
bash ./.build-scripts/config.sh

# INSTALL PACKAGES
npm cache clean --force
npm i

# PREPARE
if [ "$PLATFORM" = "Android" ]
then
  # Android
  cd android && ./gradlew clean && sudo bundle install && cd ..
else
  # iOS
  cd ios && pod install && sudo bundle install && cd ..
  curl https://www.apple.com/certificateauthority/AppleWWDRCAG3.cer -o ios/fastlane/AppleWWDRCAG3.cer
fi

# BUILD APP
bash .build-scripts/build_app.sh
