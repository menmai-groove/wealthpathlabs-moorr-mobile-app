import i18n from 'bootstrap/i18n';
import { Platform } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';

let BiometricInfo = {};

export const initialize = async () => {
  let { available, biometryType, error } = await ReactNativeBiometrics.isSensorAvailable();
  if (Platform.OS === 'ios' && parseInt(Platform.Version, 10) >= 11) {
    const result = await check(PERMISSIONS.IOS.FACE_ID);
    if (result === RESULTS.BLOCKED) {
      available = false;
    }
  }
  const isFaceID = biometryType === ReactNativeBiometrics.FaceID;
  const isTouchID = biometryType === ReactNativeBiometrics.TouchID;
  const isAndroidBiometrics = biometryType === ReactNativeBiometrics.Biometrics;

  BiometricInfo = {
    available,
    isFaceID,
    isTouchID,
    isAndroidBiometrics,
    error,
  };
};

export const getBiometricInfo = async () => {
  await initialize();
  return BiometricInfo;
};

export const checkBiometricKeysExist = async () => {
  const resultObject = await ReactNativeBiometrics.biometricKeysExist();
  const { keysExist } = resultObject;
  return keysExist;
};

export const createBiometricsKeys = async () => {
  const resultObject = await ReactNativeBiometrics.createKeys();
  const { publicKey } = resultObject;
  return publicKey;
};

export const createBiometricsSignature = (
  identify = 'username or email or phone number',
  promptMessage = 'Biometric Authentication',
) =>
  new Promise(async (resolve, reject) => {
    const epochTimeSeconds = Math.round(new Date().getTime() / 1000).toString();
    const payload = epochTimeSeconds + '-' + 'MoorrApp' + '-' + identify;
    const _createSignature = async () => {
      const resultObject = await ReactNativeBiometrics.createSignature({
        promptMessage,
        payload,
      });
      const { success, error, signature } = resultObject;
      if (success) {
        resolve({ signature, payload });
      }
      reject(error);
    };

    try {
      await _createSignature();
    } catch (err) {
      const keysExist = await checkBiometricKeysExist();
      if (keysExist && err?.code?.includes('Key permanently invalidated')) {
        try {
          await deleteBiometricsKeys();
          await createBiometricsKeys();
          await _createSignature();
        } catch (err2) {
          reject(err2);
        }
      } else {
        reject(err);
      }
    }
  });

export const simpleBiometricsPrompt = (promptMessage = 'Biometric Authentication') =>
  new Promise(async (resolve, reject) => {
    try {
      const resultObject = await ReactNativeBiometrics.simplePrompt({
        promptMessage,
      });
      const { success, error } = resultObject;
      if (success) {
        resolve(success);
      }
      reject(error);
    } catch (err) {
      if (Platform.OS === 'ios') {
        const error = new Error(i18n.t('global.biometricError'));
        reject(error);
      } else {
        reject(err);
      }
    }
  });

export const deleteBiometricsKeys = async () => {
  const resultObject = await ReactNativeBiometrics.deleteKeys();
  return resultObject;
};
