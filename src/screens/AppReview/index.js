import { useFocusEffect } from '@react-navigation/core';
import { KeyboardAwareScrollView } from 'components/basics/KeyboardAware';
import { GlobalLib, UtilLib } from 'libs';
import { useDispatchResolve } from 'libs/hooks';
import { isNumber, isString } from 'lodash';
import { useThemedStyle, withExitAppHandler } from 'providers';
import React, { useCallback, useEffect, useState } from 'react';
import { Keyboard, View } from 'react-native';
import InAppReview from 'react-native-in-app-review';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import WriteReview from 'screens/AppReview/Components/WriteReview';
import { selectFlags } from 'store/Auth/selector';
import { setAddFeedback, setDoFeedbackLater, setReviewStatus } from 'store/Home/action';
import { selectFeedbackReview, selectShowReviewPrompt } from 'store/Home/selector';

import Rating from './Components/Rating';
import ReviewSuggestion from './Components/ReviewSuggestion';
import themedStyles from './styles';

const APP_REVIEW_VERSION = 2;
const appReviewAvailable = InAppReview.isAvailable();

function InAppPreview() {
  const showReviewPrompt = useSelector(selectShowReviewPrompt);
  const flags = useSelector(selectFlags);
  const dispatchResolve = useDispatchResolve();

  const handleInAppPreview = useCallback(() => {
    dispatchResolve(setReviewStatus());
    // trigger UI InAppPreview
    InAppReview.RequestInAppReview()
      .then(hasFlowFinishedSuccessfully => {
        // when return true in android it means user finished or close review flow
        // console.log('InAppReview in android---', hasFlowFinishedSuccessfully);

        // when return true in ios it means review flow launched to user.
        // console.log('InAppReview in ios has launched successfully---', hasFlowFinishedSuccessfully);

        // 1- you have option to do something ex: (navigate Home page) (in android).
        // 2- you have option to do something,
        // ex: (save date today to launch InAppReview after 15 days) (in android and ios).

        // 3- another option:
        if (hasFlowFinishedSuccessfully) {
          // do something for ios
          // do something for android
        }

        // for android:
        // The flow has finished. The API does not indicate whether the user
        // reviewed or not, or even whether the review dialog was shown. Thus, no
        // matter the result, we continue our app flow.

        // for ios
        // the flow launched successfully, The API does not indicate whether the user
        // reviewed or not, or he/she closed flow yet as android, Thus, no
        // matter the result, we continue our app flow.
      })
      // .catch(error => {
      .catch(() => {
        // we continue our app flow.
        // we have some error could happen while launching InAppReview,
        // Check table for errors and code number that can return in catch.
        // console.log('error---', error);
      });
  }, [dispatchResolve]);

  useFocusEffect(
    useCallback(() => {
      if (showReviewPrompt && appReviewAvailable && flags.inAppReviewVisible) {
        handleInAppPreview();
      }
    }, [showReviewPrompt, handleInAppPreview, flags]),
  );

  return null;
}

function AppReview() {
  const styles = useThemedStyle(themedStyles);
  const feedbackReview = useSelector(selectFeedbackReview);

  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(9);
  const [review, setReview] = useState('');
  const dispatchResolve = useDispatchResolve();

  const onPressLater = useCallback(() => {
    GlobalLib.CustomModal.get().hide();
    dispatchResolve(setDoFeedbackLater());
  }, [dispatchResolve]);

  const onPressNext = useCallback(
    inputRating => {
      setStep(step + 1);
      if (isNumber(inputRating)) {
        setRating(inputRating);
      }
    },
    [step],
  );

  const onPressBack = useCallback(
    inputReview => {
      setStep(step - 1);
      if (isString(inputReview)) {
        setReview(inputReview);
      }
    },
    [step, setReview],
  );

  const onPressSubmit = useCallback(
    inputReview => {
      dispatchResolve(
        setAddFeedback({
          rating,
          review: inputReview,
        }),
      )
        .then(() => {
          GlobalLib.CustomModal.get().hide();
        })
        .catch(error => {
          if (error.errors[0].message === 'has-feedback') {
            GlobalLib.CustomModal.get().hide();
          }
        });
    },
    [dispatchResolve, rating],
  );

  const renderContent = useCallback(
    currentStep => {
      switch (currentStep) {
        case 1:
          return <ReviewSuggestion onPressNow={onPressNext} onPressLater={onPressLater} />;
        case 2:
          return (
            <Rating onPressNext={onPressNext} onPressLater={onPressLater} ratingNumber={rating} />
          );
        case 3:
          return (
            <WriteReview
              onPressSubmit={onPressSubmit}
              onPressBack={onPressBack}
              reviewText={review}
            />
          );
        default:
          return null;
      }
    },
    [onPressBack, onPressLater, onPressNext, onPressSubmit, rating, review],
  );

  useEffect(() => {
    if (step >= 0) {
      UtilLib.handleConfigureNextLayoutAnimation();
    }
  }, [step]);

  useEffect(() => {
    if (feedbackReview?.canAsk) {
      GlobalLib.CustomModal.get().show({
        type: 'absolute',
        body: (
          <View>
            <KeyboardAwareScrollView style={styles.container} showsVerticalScrollIndicator={false}>
              {renderContent(step)}
            </KeyboardAwareScrollView>
          </View>
        ),
        onBackdropPress: () => Keyboard.dismiss(),
      });
    }
  }, [renderContent, styles, feedbackReview, step]);

  return null;
}

export default compose(withExitAppHandler)(APP_REVIEW_VERSION === 2 ? InAppPreview : AppReview);
