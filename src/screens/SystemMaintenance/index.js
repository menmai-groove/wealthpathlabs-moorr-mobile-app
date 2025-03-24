import ProgressBar from 'components/basics/ProgressBar';
import TextField from 'components/basics/TextField';
import { AppConfigs } from 'constant';
import { RemoteConfigLib } from 'libs';
import { isEmpty } from 'lodash';
import LottieView from 'lottie-react-native';
import { useThemedStyle } from 'providers';
import React, { useEffect, useState } from 'react';
import { Image, Platform, Text, View } from 'react-native';
import codePush from 'react-native-code-push';
import SplashScreen from 'react-native-splash-screen';
import { AppStyle } from 'theme';

import themedStyles from './styles';

const DURATION = 3000;

const SystemMaintenance = () => {
  const [loading, setLoading] = useState(null);
  const [isMaintenance, setIsMaintenance] = useState(true);
  const [syncStatus, setSyncStatus] = useState();
  const [syncProgress, setSyncProgress] = useState();

  useEffect(() => {
    fetchMaintenanceFlag();
  }, []);

  const fetchMaintenanceFlag = async () => {
    try {
      await RemoteConfigLib.initialize();
      const isSystemMaintenance = RemoteConfigLib.getIsSystemMaintenance();
      setIsMaintenance(isSystemMaintenance);
      if (isSystemMaintenance) {
        setLoading(false);
        SplashScreen.hide();
      } else {
        checkCodePush();
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const codePushStatusDidChange = status => {
    setSyncStatus(status);
  };

  const codePushDownloadDidProgress = progress => {
    setSyncProgress(progress);
  };

  const deploymentKey =
    Platform.OS === 'android'
      ? AppConfigs.codePushDevelopmentKeyAndroid
      : AppConfigs.codePushDevelopmentKeyIos;

  const getCodePushMessage = status => {
    const message = require('../../langs/en.json');
    switch (status) {
      case codePush.SyncStatus.CHECKING_FOR_UPDATE:
        return message.codepushMsg.checkForUpdate;
      case codePush.SyncStatus.DOWNLOADING_PACKAGE:
        return message.codepushMsg.downloadPackage;
      case codePush.SyncStatus.INSTALLING_UPDATE:
        return message.codepushMsg.installUpdate;
      case codePush.SyncStatus.UP_TO_DATE:
        return message.codepushMsg.upToDate;
      case codePush.SyncStatus.UPDATE_INSTALLED:
        return message.codepushMsg.updatedInstalled;
      case codePush.SyncStatus.UNKNOWN_ERROR:
        return message.codepushMsg.updatedInstalled;
    }
  };

  const checkCodePush = () => {
    if (__DEV__) {
      setLoading(false);
      return;
    }
    codePush.notifyAppReady();
    codePush
      .checkForUpdate(deploymentKey)
      .then(update => {
        if (update) {
          SplashScreen.hide();
          setLoading(true);
          codePush
            .sync(
              {
                updateDialog: false,
                installMode: codePush.InstallMode.IMMEDIATE,
                mandatoryInstallMode: codePush.InstallMode.IMMEDIATE,
                deploymentKey: deploymentKey,
                rollbackRetryOptions: {
                  delayInMilliseconds: 1000,
                  maxRetryAttempts: 2,
                },
              },
              codePushStatusDidChange,
              codePushDownloadDidProgress,
            )
            .finally(() => {
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };
  const styles = useThemedStyle(themedStyles);

  if (loading == null) {
    return <View />;
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.marginBottom30}>
          <LottieView
            autoPlay
            loop={false}
            style={styles.logo}
            source={require('assets/images/moorr-animated-logo.json')}
            duration={DURATION}
          />
        </View>
        {!isEmpty(syncProgress) && (
          <View style={styles.codePushWrapper}>
            <View style={styles.codePushStatus}>
              <Text>{getCodePushMessage(syncStatus)}</Text>
            </View>
            <View>
              <ProgressBar
                progress={syncProgress.receivedBytes / syncProgress.totalBytes}
                barStyle={styles.syncProgressBar}
              />
            </View>
          </View>
        )}
      </View>
    );
  } else {
    if (isMaintenance) {
      return (
        <View style={styles.container}>
          <View>
            <Image style={styles.icon} source={require('assets/images/optiIcon/newVer.png')} />
          </View>
          <View style={styles.contentCover}>
            <TextField type="heading-2" style={styles.label}>
              {'System Maintenance'}
            </TextField>
            <TextField style={[styles.content, AppStyle.marginX30]}>
              {
                'We are performing some upgrades to enhance your experience. The system will be back online shortly. Please check back later!'
              }
            </TextField>
          </View>
        </View>
      );
    }

    const App = require('../../index').default;
    return <App />;
  }
};

export default SystemMaintenance;
