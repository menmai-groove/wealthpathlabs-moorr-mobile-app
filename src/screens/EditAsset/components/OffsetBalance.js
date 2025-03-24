import TextField from 'components/basics/TextField';
import TouchableField from 'components/basics/TouchableField';
import { AppConstants, AppScreenID } from 'constant';
import { GlobalLib, NavigationServiceLib } from 'libs';
import { formatCurrency } from 'libs/util';
import { isEmpty, round } from 'lodash';
import { useThemedStyle } from 'providers';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import EnIcon from 'react-native-vector-icons/Entypo';
import { useSelector } from 'react-redux';
import { selectOffsetBenefitValues } from 'store/InsightsTabContent/selector';
import { AppStyle } from 'theme';

const i18nScope = 'components.offsetBalance';
const OffsetBalance = () => {
  const { t } = useTranslation();
  const styles = useThemedStyle(themedStyles, i18nScope);
  const offsetBalance = useSelector(selectOffsetBenefitValues);

  const isOffsetHigherTotalLoans =
    offsetBalance?.totalCount === 1 &&
    offsetBalance?.amount > offsetBalance?.borrowing?.outstanding;

  const isTotalAmountOffsetHigherTotalLoans =
    offsetBalance?.totalCount > 1 &&
    offsetBalance?.totalAmount > offsetBalance?.borrowing?.outstanding;

  const annually = useMemo(() => {
    if (isOffsetHigherTotalLoans) {
      const borrowing = offsetBalance?.borrowing;
      return round((borrowing?.outstanding * borrowing?.interestRate) / 100, 2);
    }
    return round(offsetBalance?.benefit, 2);
  }, [offsetBalance]);

  const monthly = useMemo(() => {
    return round(annually / 12, 2);
  }, [annually]);

  const warningMessage = () => {
    if (isOffsetHigherTotalLoans) {
      return (
        <View style={[AppStyle.rowFlex, styles.warningContainer]}>
          <EnIcon
            name="warning"
            size={20}
            color={styles.warningContent.color}
            style={styles.iconWarning}
          />
          <TextField type="captain" style={styles.warningContent}>
            {t(`${i18nScope}.warningMsgOffsetHigherTotalLoans`)}
          </TextField>
        </View>
      );
    }
    if (isTotalAmountOffsetHigherTotalLoans) {
      const borrowing = offsetBalance?.borrowing;
      const loanCardName = borrowing?.name ?? AppConstants.cardCategory.Borrowing;
      const loanCardAmount = round(
        ((borrowing?.outstanding ?? 0) * (borrowing?.interestRate ?? 0)) / 100,
        2,
      );
      return (
        <View style={[AppStyle.rowFlex, styles.warningContainer]}>
          <EnIcon
            name="warning"
            size={20}
            color={styles.warningContent.color}
            style={styles.iconWarning}
          />
          <TextField type="captain" style={styles.warningContent}>
            {t(`${i18nScope}.warningMsgTotalAmountOffsetHigherTotalLoan1`)}
            <TextField
              type="captain"
              style={styles.warningContent}
              font="semi-bold">{`${loanCardName}`}</TextField>
            {t(`${i18nScope}.warningMsgTotalAmountOffsetHigherTotalLoan2`)}
            <TextField type="captain" style={styles.warningContent} font="semi-bold">
              {formatCurrency(loanCardAmount)}
            </TextField>
            {t(`${i18nScope}.warningMsgTotalAmountOffsetHigherTotalLoan3`)}
          </TextField>
        </View>
      );
    }
    return <></>;
  };

  const openInfoDialog = useCallback(() => {
    const redirectToLoanCard = () => {
      const borrowing = offsetBalance?.borrowing;
      const itemValue = {
        id: [borrowing?.id],
        name: borrowing?.name,
      };
      NavigationServiceLib.navigate(AppScreenID.Borrowing, {
        borrowing: itemValue,
      });
      GlobalLib.ConfirmModal.get().hide();
    };

    GlobalLib.ConfirmModal.get().show({
      top: (
        <View>
          <FastImage
            source={require('assets/images/optiIcon/infoNoti.png')}
            style={styles.infoNoti}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
      ),
      title: t(`${i18nScope}.offsetBenefit`),
      content: () => (
        <TextField style={[AppStyle.marginBottom30, AppStyle.textLeft]}>
          {t(`${i18nScope}.offsetBenefitContent`)}
          <TextField font="semi-bold">{` ${
            offsetBalance?.borrowing?.name ?? AppConstants.cardCategory.Borrowing
          }`}</TextField>
          <TextField>{' in which you have entered an interest rate of '}</TextField>
          <TextField font="semi-bold">{`${round(
            offsetBalance?.borrowing?.interestRate ?? 0,
            2,
          )}%. `}</TextField>
          <TouchableField onPress={() => redirectToLoanCard()}>
            <TextField style={styles.textWithLink} suppressHighlighting={true}>
              {t(`${i18nScope}.goToLoan`)}
            </TextField>
          </TouchableField>
        </TextField>
      ),
      okText: t('global.close'),
      onlyOneButton: true,
      style: {
        title: styles.infoTitle,
      },
    });
  }, [offsetBalance]);

  if (offsetBalance == null || isEmpty(offsetBalance)) {
    return <View />;
  }

  return (
    <View
      style={[
        AppStyle.padX10,
        AppStyle.padTop20,
        AppStyle.padBottom10,
        AppStyle.marginX10,
        styles.container,
      ]}>
      <View style={[AppStyle.rowFlex, AppStyle.justifyContent]}>
        <Image source={require('assets/images/offset-bank.png')} style={styles.icon} />
        <View style={[AppStyle.columnFlex, AppStyle.justifyContent]}>
          <TextField type="paragraph-1" font="regular" style={AppStyle.textCenter}>
            {t(`${i18nScope}.offsetBalance`)}
          </TextField>
          <TextField type="heading-1" font="medium" style={AppStyle.textCenter} numberOfLines={1}>
            {formatCurrency(offsetBalance?.amount ?? 0)}
          </TextField>
        </View>
      </View>
      <View style={[AppStyle.padX30, AppStyle.marginTop10]}>
        <View style={[AppStyle.rowFlex, AppStyle.alignContent]}>
          <TextField style={[styles.label]}>{t(`${i18nScope}.expectedOffset`)}</TextField>
          <View style={AppStyle.pad5}>
            <TouchableField style={{}} onPress={openInfoDialog}>
              <FastImage
                style={styles.infoIcon}
                source={require('assets/images/more-info.png')}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableField>
          </View>
        </View>
        {!isTotalAmountOffsetHigherTotalLoans && (
          <View style={[AppStyle.rowFlex, AppStyle.padTop5]}>
            <View style={[AppStyle.columnFlex, AppStyle.flex1]}>
              <TextField type="heading-1" font="medium" numberOfLines={1}>
                {formatCurrency(monthly)}
              </TextField>
              <TextField style={styles.label}>{'Monthly'}</TextField>
            </View>
            <View style={styles.separator} />
            <View style={[AppStyle.columnFlex, AppStyle.flex1, AppStyle.padLeft25]}>
              <TextField type="heading-1" font="medium" numberOfLines={1}>
                {formatCurrency(annually)}
              </TextField>
              <TextField style={styles.label}>{'Annually'}</TextField>
            </View>
          </View>
        )}
      </View>
      {warningMessage()}
    </View>
  );
};

export default OffsetBalance;

const themedStyles = {
  container: { borderRadius: 20, borderWidth: 1, borderColor: '#F2F2F2', marginTop: 20 },
  icon: { width: 45, height: 45, resizeMode: 'contain', marginRight: 10 },
  separator: { flex: 0, width: 1, backgroundColor: '#C4C4C4' },
  label: { color: '#ACACAC' },
  warningContainer: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FFA850',
    backgroundColor: '#FFF6EE',
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: 'center',
    marginTop: 15,
  },
  warningContent: { color: '#FFA850', flex: 1 },
  iconWarning: {
    with: 20,
    height: 20,
    marginHorizontal: 10,
  },
  infoTitle: {
    color: 'palette.color-primary-1',
  },
  infoIcon: {
    width: 16,
    height: 16,
  },
  infoNoti: {
    width: '48@s',
    height: '46.08@s',
  },
  textWithLink: {
    color: 'palette.color-blue-1',
    textDecorationLine: 'underline',
  },
};
