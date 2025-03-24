import ButtonField from 'components/basics/ButtonField';
import CustomMarkdown from 'components/basics/CustomMarkdown';
import { AppScreenID } from 'constant';
import screenID from 'constant/screenID';
import { GlobalLib, NavigationServiceLib, UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { mergeArrayObjectIntoObject } from 'libs/util';
import { get, isEmpty, isNil } from 'lodash';
import { useThemedStyle } from 'providers';
import React, { forwardRef, useCallback, useImperativeHandle } from 'react';
import { ScrollView, View } from 'react-native';
import { triggerButtonCampaign } from 'store/Notification/action';
import { AppStyle } from 'theme';

import themedStyles from './style';

export const CAMPAIGN_DIALOG_STYLE = {
  BASIC_POPUP: 'basic-popup',
  OPTI_PROMPT: 'opti-prompt',
};

const CAMPAIGN_BUTTON_ACTION = {
  DISMISS: 'dismiss',
  DIALOG: 'dialog',
  LINK: 'link',
  UI: 'ui',
};

const CAMPAIGN_BUTTON_STYLE = {
  GREEN: 'green',
  GREY_TEXT: 'grey-text',
  PURPLE: 'purple',
};

const campaignModal = GlobalLib.CustomModal.get();

export const handleDialog = async campaignInput => {
  if (isNil(campaignInput)) {
    return;
  }
  const initialDialogId = get(campaignInput, ['initialDialogId']);
  const dialogs = get(campaignInput, ['dialogs']);
  const initialDialog = dialogs?.find(dialog => get(dialog, ['dialogId']) === initialDialogId);
  const campaignStyle = get(initialDialog, ['style']);
  if (initialDialog) {
    switch (campaignStyle) {
      case CAMPAIGN_DIALOG_STYLE.OPTI_PROMPT:
        campaignModal.hide();
        NavigationServiceLib.push(screenID.Campaign, {
          campaign: campaignInput,
        });
        break;
      case CAMPAIGN_DIALOG_STYLE.BASIC_POPUP:
        await campaignModal.hide();
        campaignModal.show({
          body: <WrappedCampaignContent campaign={campaignInput} />,
        });
        break;
      default:
    }
  }
};

export const CampaignButton = ({ button, campaign }) => {
  const dispatchResolve = useDispatchResolve();

  const buttonStyle = get(button, ['style']);
  const label = get(button, ['label']);
  const handleCampaignButton = useCallback(() => {
    const action = get(button, ['action']);
    switch (action) {
      case CAMPAIGN_BUTTON_ACTION.DISMISS:
        const initialDialogId = get(campaign, ['initialDialogId']);
        const dialogs = get(campaign, ['dialogs']);
        const initialDialog = dialogs?.find(
          dialog => get(dialog, ['dialogId']) === initialDialogId,
        );
        const campaignStyle = get(initialDialog, ['style']);
        switch (campaignStyle) {
          case CAMPAIGN_DIALOG_STYLE.BASIC_POPUP:
            campaignModal.hide();
            break;
          case CAMPAIGN_DIALOG_STYLE.OPTI_PROMPT:
          default:
            break;
        }
        NavigationServiceLib.removeScreen(AppScreenID.Campaign);
        break;
      case CAMPAIGN_BUTTON_ACTION.DIALOG:
        const nexDialogId = get(button, ['dialogId']);
        const newCampaign = {
          ...campaign,
          initialDialogId: nexDialogId,
        };
        setTimeout(() => {
          handleDialog(newCampaign);
        }, 100);
        break;
      case CAMPAIGN_BUTTON_ACTION.UI:
        campaignModal.hide();
        const nextUI = get(button, ['ui']);
        NavigationServiceLib.navigate(nextUI);
        break;
      case CAMPAIGN_BUTTON_ACTION.LINK:
        campaignModal.hide();
        const link = get(button, ['link']);
        link && UtilLib.openInAppBrowserLink(link);
        break;
      default:
    }
    if (!isEmpty(action)) {
      dispatchResolve(
        triggerButtonCampaign({
          buttonId: button?.buttonId,
          dialogId: campaign?.initialDialogId,
          campaignId: campaign?.campaignId,
        }),
      );
    }
  }, [button, campaign, dispatchResolve]);

  const campaignButtonStyle = useCallback(buttonStyleInput => {
    switch (buttonStyleInput) {
      case CAMPAIGN_BUTTON_STYLE.GREY_TEXT:
        return {
          style: {
            backgroundColor: 'white',
          },
          textStyle: {
            color: '#4F4F4F',
          },
        };
      case CAMPAIGN_BUTTON_STYLE.GREEN:
        return {
          style: {
            backgroundColor: '#66E84B',
          },
          textStyle: {
            color: '#541868',
          },
        };
      case CAMPAIGN_BUTTON_STYLE.PURPLE:
      default:
        return {};
    }
  }, []);

  return (
    <ButtonField
      {...campaignButtonStyle(buttonStyle)}
      text={label}
      onPress={handleCampaignButton}
    />
  );
};

const i18nScope = 'components.campaignContent';

function CampaignContent({ style, campaign }, ref) {
  const convertedStyle = mergeArrayObjectIntoObject(style);
  const styles = useThemedStyle({ ...themedStyles, ...convertedStyle }, i18nScope);

  useImperativeHandle(ref, () => ({}));

  // const campaignId = get(campaign, ['campaignId']);
  const initialDialogId = get(campaign, ['initialDialogId']);
  const dialogs = get(campaign, ['dialogs']);
  const initialDialog = dialogs?.find(dialog => get(dialog, ['dialogId']) === initialDialogId);
  const header = get(initialDialog, ['header']);
  const body = get(initialDialog, ['body']);
  const buttons = get(initialDialog, ['buttons']);

  return (
    <View style={[AppStyle.padX15]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {!isNil(header) ? (
          <View style={[AppStyle.textAlign, AppStyle.alignContent]}>
            <CustomMarkdown style={[styles?.markdownStyle, AppStyle.textAlign]}>
              {header}
            </CustomMarkdown>
          </View>
        ) : null}
        {!isNil(body) ? (
          <View>
            <CustomMarkdown style={styles?.markdownStyle}>{body}</CustomMarkdown>
          </View>
        ) : null}
        {buttons?.length > 0 ? (
          <View style={[AppStyle.marginTop15]}>
            {buttons.map((button, bi) => {
              return (
                <View key={`campaign-button-${bi}`} style={[AppStyle.marginTop10]}>
                  <CampaignButton style={styles} campaign={campaign} button={button} />
                </View>
              );
            })}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const WrappedCampaignContent = forwardRef(CampaignContent);

export default WrappedCampaignContent;
