export HOME=/Users/dropify
export NVM_DIR="PATH_TO_NVM"
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
export ANDROID_HOME="$HOME/Library/Android/sdk"

echo "Remote to Dropify server"
echo "$BUILD_ENVIRONMENT"
echo "$GIT_BRANCH"
echo "$OS"
echo "$VERSION"

security default-keychain -s 'PATH_TO_KEY_CHAIN'
security -v unlock-keychain -p "$DROPIFY_PASSWORD" 'PATH_TO_KEY_CHAIN'

PATH=$PATH:/usr/local/bin
PATH=$PATH:/usr/sbin
bash "/usr/local/opt/nvm/nvm.sh"

echo "Reach Dropify server and Start build"

CODE_PATH=""
ASSET_PATH=""
PROVISION_PATH=""

cd "$ASSET_PATH"
eval `ssh-agent -s`
ssh-add ""
git add -A
git reset --hard
git fetch origin
git checkout main
git pull


cd "$CODE_PATH"
eval `ssh-agent -s`
ssh-add ""
git add -A
git reset --hard
git fetch origin
git checkout "$GIT_BRANCH" || git checkout --track "origin/$GIT_BRANCH"
git pull

cd "$ASSET_PATH"
rm -rf node_modules
nvm use 12.18.3
npm install

ASSET_NAME=""

if [ "$VERSION" = "Development" ]; then
    ASSET_NAME="xxx-dev"
fi

if [ "$VERSION" = "Staging" ]; then 
    ASSET_NAME="xxx-staging"
fi

if [ "$VERSION" = "Production" ]; then 
    ASSET_NAME="xxx-production"
fi

buildAndroid()
{
    # Build Android
    bash patch.sh "$ASSET_PATH/$ASSET_NAME/" "$CODE_PATH" "$VERSION" "$PROVISION_PATH/$ASSET_NAME/"
    cd "$CODE_PATH"
    rm -rf node_modules
    nvm use 12.18.3
    npm install

    echo "Start building app for android"
    cd "$CODE_PATH/android"
    rvm use ruby-2.6.3
    ./gradlew clean
    fastlane jenkins
}

buildIOS()
{
    # Build iOS
    bash patch.sh "$ASSET_PATH/$ASSET_NAME/" "$CODE_PATH" "$VERSION" "$PROVISION_PATH/$ASSET_NAME/"
    cd "$CODE_PATH"
    rm -rf node_modules
    nvm use 12.18.3
    npm install

    echo "Start building app for ios"
    cd "$CODE_PATH/ios"
    rvm use system
    rm -rf Pods
    pod update
    fastlane jenkins
}

if [ "$OS" = "ALL" ]; then
    buildAndroid
    buildIOS
elif [ "$OS" = "Android" ]; then
    buildAndroid
else
    buildIOS
fi

