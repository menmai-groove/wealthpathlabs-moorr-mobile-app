import { useRoute } from '@react-navigation/core';
import Header from 'components/layouts/Header';
import { AppConstants } from 'constant';
import { GlobalLib, NavigationServiceLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { useOnBackButtonPress, useThemedStyle } from 'providers';
import withDynamicModuleLoader from 'providers/dynamicModuleLoader/consumer';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import AddNewAssetStep1 from 'screens/AddAsset/components/step/AddNewAssetStep1';
import AddNewAssetStep2 from 'screens/AddAsset/components/step/AddNewAssetStep2';
import AddNewAssetStep3 from 'screens/AddAsset/components/step/AddNewAssetStep3';
import AddNewAssetStep4 from 'screens/AddAsset/components/step/AddNewAssetStep4';
import AddNewAssetStep5 from 'screens/AddAsset/components/step/AddNewAssetStep5';
import AddNewAssetStep6 from 'screens/AddAsset/components/step/AddNewAssetStep6';
import AddNewAssetStep7 from 'screens/AddAsset/components/step/AddNewAssetStep7';
import AddNewAssetStep8 from 'screens/AddAsset/components/step/AddNewAssetStep8';
import AddNewAssetStep9 from 'screens/AddAsset/components/step/AddNewAssetStep9';
import { resetData, updateData } from 'store/Asset/action';
import { AddNewAssetStep, Purposes } from 'store/Asset/constants';
import getModule from 'store/Asset/module';
import { selectAssetPurpose, selectAssetType } from 'store/Asset/selector';

import themedStyles from './styles';

const i18nScope = 'screens.asset';
const i18nScopeForm = 'forms.asset';

function AddNewAsset() {
  const { t } = useTranslation();
  const route = useRoute();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const assetPurpose = useSelector(selectAssetPurpose);
  const assetType = useSelector(selectAssetType);
  const dispatch = useDispatchResolve();
  const [currentStep, setStep] = useState(AddNewAssetStep.Step1);
  useOnBackButtonPress(() => handleGoBack());
  const handleNextStep = useCallback(
    data => {
      switch (currentStep) {
        case AddNewAssetStep.Step1:
          dispatch(resetData());
          dispatch(updateData(data));
          if (
            data.type === AppConstants.AssetType.Property ||
            data.type === AppConstants.AssetType.Investments
          ) {
            setStep(AddNewAssetStep.Step5);
          } else {
            setStep(AddNewAssetStep.Step2);
          }
          break;
        case AddNewAssetStep.Step2:
          dispatch(updateData(data));
          setStep(AddNewAssetStep.Step3);
          break;
        case AddNewAssetStep.Step3:
          dispatch(updateData(data));
          setStep(AddNewAssetStep.Step4);
          break;
        case AddNewAssetStep.Step5:
          dispatch(updateData(data));
          if (assetType === AppConstants.AssetType.Property) {
            if (
              data?.purpose?.value === Purposes.Investment ||
              data?.purpose?.value === Purposes.Business
            ) {
              setStep(AddNewAssetStep.Step6);
            } else if (data?.purpose?.value === Purposes.Personal) {
              setStep(AddNewAssetStep.Step7);
            } else {
              setStep(AddNewAssetStep.Step8);
            }
          } else if (assetType === AppConstants.AssetType.Investments) {
            setStep(AddNewAssetStep.Step6);
          }
          break;
        case AddNewAssetStep.Step6:
          dispatch(updateData(data));
          setStep(AddNewAssetStep.Step7);
          break;
        case AddNewAssetStep.Step7:
          dispatch(updateData(data));
          setStep(AddNewAssetStep.Step8);
          break;
        case AddNewAssetStep.Step8:
          setStep(AddNewAssetStep.Step9);
          break;
        default:
          break;
      }
    },
    [assetType, currentStep, dispatch],
  );

  const handleCancel = useCallback(() => {
    GlobalLib.ConfirmModal.get().show({
      title: t(`${i18nScopeForm}.cancelConfirmation`),
      content: t(`${i18nScopeForm}.areYouSureCancelAsset`),
      onConfirm: () => {
        NavigationServiceLib.pop();
      },
    });
  }, [t]);

  const handleGoBack = useCallback(() => {
    switch (currentStep) {
      case AddNewAssetStep.Step2:
        setStep(AddNewAssetStep.Step1);
        break;
      case AddNewAssetStep.Step3:
        setStep(AddNewAssetStep.Step2);
        break;
      case AddNewAssetStep.Step4:
        setStep(AddNewAssetStep.Step3);
        break;
      case AddNewAssetStep.Step5:
        setStep(AddNewAssetStep.Step1);
        break;
      case AddNewAssetStep.Step6:
        setStep(AddNewAssetStep.Step5);
        break;
      case AddNewAssetStep.Step7:
        if (assetType === AppConstants.AssetType.Property) {
          if (assetPurpose === Purposes.Investment || assetPurpose === Purposes.Business) {
            setStep(AddNewAssetStep.Step6);
          }
          if (assetPurpose === Purposes.Personal) {
            setStep(AddNewAssetStep.Step5);
          }
        }
        if (assetType === AppConstants.AssetType.Investments) {
          setStep(AddNewAssetStep.Step6);
        }
        break;
      case AddNewAssetStep.Step8:
        if (assetType === AppConstants.AssetType.Property) {
          if (
            assetPurpose === Purposes.Investment ||
            assetPurpose === Purposes.Business ||
            assetPurpose === Purposes.Personal
          ) {
            setStep(AddNewAssetStep.Step7);
          } else {
            setStep(AddNewAssetStep.Step5);
          }
        } else if (assetType === AppConstants.AssetType.Investments) {
          setStep(AddNewAssetStep.Step7);
        }
        break;
      case AddNewAssetStep.Step9:
        NavigationServiceLib.pop();
        break;
      case AddNewAssetStep.Step1:
        handleCancel();

        break;
      default:
        break;
    }
  }, [assetType, assetPurpose, currentStep, handleCancel]);

  useEffect(() => {
    if (route?.params?.nextStepData) {
      handleNextStep(route?.params?.nextStepData);
    }
  }, [route]);

  const renderStep = useMemo(() => {
    switch (currentStep) {
      case AddNewAssetStep.Step2:
        return <AddNewAssetStep2 onPress={handleNextStep} onCancel={handleCancel} />;
      case AddNewAssetStep.Step3:
        return <AddNewAssetStep3 onPress={handleNextStep} onCancel={handleCancel} />;
      case AddNewAssetStep.Step4:
        return (
          <AddNewAssetStep4
            upDateData={data => dispatch(updateData(data))}
            onCancel={handleCancel}
            startDate={route?.params?.startDate}
          />
        );
      case AddNewAssetStep.Step5:
        return <AddNewAssetStep5 onPress={handleNextStep} onCancel={handleCancel} />;
      case AddNewAssetStep.Step6:
        return <AddNewAssetStep6 onPress={handleNextStep} onCancel={handleCancel} />;
      case AddNewAssetStep.Step7:
        return <AddNewAssetStep7 onPress={handleNextStep} onCancel={handleCancel} />;
      case AddNewAssetStep.Step8:
        return <AddNewAssetStep8 onPress={handleNextStep} onCancel={handleCancel} />;
      case AddNewAssetStep.Step9:
        return <AddNewAssetStep9 onPress={handleNextStep} onCancel={handleCancel} />;
      default:
        AddNewAssetStep.Step1;
        return <AddNewAssetStep1 onPress={handleNextStep} onCancel={handleCancel} />;
    }
  }, [currentStep, handleNextStep, handleCancel, dispatch]);

  return (
    <View style={styles.container}>
      <Header
        type={currentStep === AddNewAssetStep.Step9 ? 'auth' : 'full'}
        title={t(`${i18nScope}.title`)}
        style={styles.headerPadding}
        onBackHeader={() => handleGoBack()}
        numberOfLines={1}
      />
      {renderStep}
    </View>
  );
}

export default compose(withDynamicModuleLoader(getModule()))(AddNewAsset);
