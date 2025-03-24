bash ../.build-scripts/encrypt.sh $ENCRYPTED_KEY development/google-services.json development/google-services.json.encrypt
bash ../.build-scripts/encrypt.sh $ENCRYPTED_KEY development/GoogleService-Info.plist development/GoogleService-Info.plist.encrypt
bash ../.build-scripts/encrypt.sh $ENCRYPTED_KEY development/moorr.keystore development/moorr.keystore.encrypt
bash ../.build-scripts/encrypt.sh $ENCRYPTED_KEY development/service_account.json development/service_account.json.encrypt
bash ../.build-scripts/encrypt.sh $ENCRYPTED_KEY development/distribution.mobileprovision development/distribution.mobileprovision.encrypt
bash ../.build-scripts/encrypt.sh $ENCRYPTED_KEY development/distribution.p12 development/distribution.p12.encrypt
bash ../.build-scripts/encrypt.sh $ENCRYPTED_KEY development/facebooksdk.txt development/facebooksdk.txt.encrypt

# ENCRYPTED_KEY=

# bash ../.build-scripts/encrypt.sh $ENCRYPTED_KEY development/distribution.mobileprovision development/distribution.mobileprovision.encrypt
# bash ../.build-scripts/encrypt.sh $ENCRYPTED_KEY development/distribution.p12 development/distribution.p12.encrypt

# bash ../.build-scripts/encrypt.sh $ENCRYPTED_KEY staging/distribution.mobileprovision staging/distribution.mobileprovision.encrypt
# bash ../.build-scripts/encrypt.sh $ENCRYPTED_KEY staging/distribution.p12 staging/distribution.p12.encrypt

# bash ../.build-scripts/encrypt.sh $ENCRYPTED_KEY production/distribution.mobileprovision production/distribution.mobileprovision.encrypt
# bash ../.build-scripts/encrypt.sh $ENCRYPTED_KEY production/distribution.p12 production/distribution.p12.encrypt
