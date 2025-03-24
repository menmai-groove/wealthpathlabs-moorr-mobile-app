# Groove React Native MyWealth App

### 1. Get started

#### Step 1: Using fork, normal clone, or template clone the repository

#### Step 2: Rename repository

- Install `react-native-rename` globally
- Run `npx react-native-rename <your project name> -b <android-bundle-id>`
- Update iOS Application ID in Xcode
- Update property `APP_NAME_REGISTRY` in `app.json`

#### Step 3: Decide whether to keep or remove OTA method with `react-native-code-push`

```
    "react-native": "0.63.2",
    "react-native-code-push": "^6.0.0",
    "react-native-code-push-saga": "^1.0.1",
    "react-native-device-info": "^5.6.3",
```

Update installation according to these document

- [Android](https://github.com/microsoft/react-native-code-push/blob/master/docs/setup-android.md)
- [iOS](https://github.com/microsoft/react-native-code-push/blob/master/docs/setup-ios.md)

#### Step 4: Install dependency and native module

- `npm install`
- `cd android && ./gradlew clean`
- `cd ios && pod install`

#### Step 4: Install environment

- `cp .sample.env .env`
- `react-native run-ios` or `react-native run-android`

### 2. Common script

| No. | Script                | description                                                                                                                     |
| --- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `npm run android`     | equal with `react-native run-android`                                                                                           |
| 2   | `npm run ios`         | equal with `react-native run-ios`                                                                                               |
| 3   | `npm run start`       | Start metro bundle in default port 8081                                                                                         |
| 4   | `npm run test`        | Run Jest test. Jest will run all test cases defined in format `__tests__/file.js` or `tests/file.js`                            |
| 5   | `npm run generate`    | Generate a component, screen or redux module                                                                                    |
| 6   | `npm run reset-cache` | Clear all javascript cache and restart metro bundle. Sometime, you need to remove the app in simulator or device to take effect |
| 7   | `npm run lint`        | Run eslint fix for all codebase                                                                                                 |
| 8   | `npm run lint-test`   | Run eslint test for all codebase. Used in CI/CD                                                                                 |

### 3. Features

#### 3.1 Manage multiple themes

- Handle app theme via `providers/appTheme`
- Use hook `useThemedStyle` to map a stylesheet with a `theme.json` file
  Example:

```
# style.js
export default {
  text: {
    color: 'palette.color-white-1',
    fontSize: 16,
    fontFamily: 'typography.text-font-family-semi-bold',
    fontWeight: 'typography.text-font-weight-600',
    lineHeight: 'typography.text-line-height-5',
    textAlign: 'center',
  },
};
```

```
# Using hook:
import { useThemedStyle } from 'providers';
import themedStyles from './style';

const styles = useThemedStyle(themedStyles, 'CUSTOM_MAPPING_STYLE');
console.log(styles);
```

#### 3.2 Handle orientation

- Handle app theme via `providers/orientation`

Example:

```
# Using hook in function component
import { useOrientation } from 'providers';

const { isLandscape, mode, screenHeight, screenWidth } = useOrientation();
```

```
# Using withOrientation in class component
import { withOrientation } from 'providers';

class MyComponent extends React.Component {
    componentDidMount() {
       const { isLandscape, mode, screenHeight, screenWidth } = this.props.orientation;
    }
};

export default compose(withConnect, withTranslation())(MyComponent);
```

#### 3.3 Handle Back button on Android

- Handle app theme via `providers/backHandler`
- Using withBackHandler if you want to press back to pop screenWidth

```
import { withBackHandler } from 'providers';

export default compose(withTranslation(), withBackHandler)(RequestPassword);
```

- Using withExitAppHandler if you want to quit app by double back

```
import { withExitAppHandler } from 'providers';

export default compose(withTranslation(), withExitAppHandler)(Home);
```

#### 3.4 Common components

##### 3.4.1 TextField

```
import TextField from 'components/basics/TextField';

<TextField type="heading-2" font="medium" style={customStyle}>
    THIS IS MY DEMO TEXT
</TextField>

```

##### 3.4.2 InputField

```
import InputField from 'components/basics/InputField';

<InputField
    ref={myEmail}
    value={value}
    keyboardType="email-address"
    textContentType="emailAddress"
    onBlur={onBlur}
    onChangeText={onChange}
    onSubmitEditing={onSubmitEditing}
    error={errors.email?.message}
    label="Email"
    placeholder="Input your email"
    multiline // if text area
    numberOfLines={10} // if text area
/>
```

##### 3.4.3 InputPasswordField

```
import InputPasswordField from 'components/basics/InputPasswordField';

<InputPasswordField
    ref={passwordInput}
    value={value}
    onBlur={onBlur}
    onChangeText={onChangeText}
    onSubmitEditing={onSubmitEditing}
    error={errors.password?.message}
    label="Password"
    placeholder="Input your password"
/>
```

##### 3.4.4 ButtonField

```
import ButtonField from 'components/basics/ButtonField';

<ButtonField
    text="THIS IS MY BUTTON"
    style={containerStyle}
    textStyle={textStyle}
    onPress={callback}
/>
```

##### 3.4.5 TouchableField

```
import TouchableField from 'components/basics/TouchableField';

<TouchableField style={customStyle} onPress={callback}>
    <Icon
      name={'close-box'}
      size={24}
      color="#000000"
    />
</TouchableField>

```

##### 3.4.6 Toast

To show a success toast message, invoke the `toastSuccess` function as following:

```js
import { GlobalLib } from 'libs';

// your code

GlobalLib.Toast.get().toastSuccess(/* your message here */);

// your code
```

Instead of `toastSuccess`, you can use `toastInfo`, `toastWarning`, `toastError` for information, warning or error toast messages respectively.

##### 3.4.7 ConfirmModal

To show a confirm modal, invoke the `show` function as following:

```js
import { GlobalLib } from 'libs';

// your code

GlobalLib.ConfirmModal.get().show({
  title: /* your title here */,
  content: /* your content here */,
  onConfirm: /* your function here */,
  // other options declared here
});

// your code
```

Or else, to hide it:

```js
GlobalLib.ConfirmModal.get().hide();
```

#### 3.5 Use `composeWithRef` to wrap your custom component

`composeWithRef` is a HoC function returning a component that receives `ref` passed from its parent component.
As inspired by Redux's `compose`, `composeWithRef` lets you write deeply nested function transformations without the rightward drift of the code and helps you to pass `ref` through components easily.

```js
import { composeWithRef } from 'libs/util';

const MyComponent = (
  { ...props },
  ref, // ref is passed to function component as a second argument
) => {
  // your code

  useImperativeHandle(
    ref,
    // Function that returns the instance value that is exposed to parent components when using `ref`
    () => ({
      // Some properties to be exposed
    }),
    [],
  );

  // your code
};

export default composeWithRef()(MyComponent);
// List of HoC functions separated by commas (,)
// e.g. withSafeAreaInsets
```

Now you can use `MyComponent` as following:

```js

import MyComponent from {/* path to MyComponent */};

<MyComponent ref=(ref => {
  // Do whatever
}) />

```

Note: The component now can receive any properties except `forwardRef`.

### 4. Development

#### 4.1 Create an Redux module

run `npm run generate redux`

#### 4.2 Create an screen

run `npm run generate screen`

#### 4.3 Create an component

run `npm run generate component`

#### 4.4 Redux module loader

##### 4.4.1 Some module needs to load when app launched

```
# Init reducer - bootstrap/reducer.js

import { homeReducer } from 'store/Home/reducer';
import { rootReducer } from 'store/Root/reducer';
import { combineReducers } from 'redux';

export default combineReducers({
  root: rootReducer,
  auth: authReducer,
  home: homeReducer,
};

```

```
# Init saga - bootstrap/store.js

Saga.run(rootSaga);
Saga.run(authSaga);
Saga.run(homeSaga);
```

##### 4.4.2 Some module only load when screen did mount

```
# redux/resetpassword/module.js

import { attachReducer } from 'redux-dynostore/core';
import dynamic from 'redux-dynostore/react-redux';
import { runSaga } from 'redux-dynostore/redux-saga';
import reducer from './reducer';
import saga from './saga';

const getModule = () =>
  dynamic('resetpassword', attachReducer(reducer), runSaga(saga));

export default getModule;
```

```
# screen/ResetPassword.js
import getModule from 'store/ResetPassword/module';

export default compose(
  withTranslation(),
  withBackHandler,
  getModule(),
)(ResetPassword);
```

### 5. CI with Jenkin pineline

##### 5.1 Branch convention

1. `master` is stable branch
2. `develop` is main stream development branch. every `feature`, `bugfix` and `upgrade` branch is `checkout`ed from this branch
3. `feature`, `bugfix` are ticket specific branch. When create PR, every branch will be verified with `Test` stage
4. `release` branchs are `checkout`ed from `develop` branch. `release` branchs should have format comfort to regex: `release\/[0-9]+.[0-9]+.[0-9]+-[a-zA-Z0-9]+`. If you want to have a different format. Please update in `Jenkinsfile` file, Stage `release`. When a `release` branch is created, `Test` stage and `Release Application` stage will be run
5. `release-react` branchs are `checkout`ed from `develop` branch. . When a `release-react` branch is created, `Test` stage and `Release React` stage will be run. Currently not configured

##### 5.2 Stage

1. `Test` stage is supposed to run on every PR and branch
2. `Release Application` stage is supposed to run on `release` branch. Method release using SSH build to Dropify build machine.

#### 6. Update fastlane session CircleCI Manual Build Parameters
Enter the email for fastlane and the CircleCI token.
```
  sh update-fastlane-session.sh
```
| Parameters        | Value                          |
| ----------------- | ------------------------------ |
| COMMANDS          | codepush_Development_Android   |
|                   | codepush_Development_iOS       |
|                   | codepush_Development_Both      |
|                   | deploy_Development_Android     |
|                   | deploy_Development_iOS         |
|                   | deploy_Development_Both        |
|                   |                                |
|                   | codepush_Staging_Android       |
|                   | codepush_Staging_iOS           |
|                   | codepush_Staging_Both          |
|                   | deploy_Staging_Android         |
|                   | deploy_Staging_iOS             |
|                   | deploy_Staging_Both            |
|                   |                                |
|                   | codepush_Production_Android    |
|                   | codepush_Production_iOS        |
|                   | codepush_Production_Both       |
|                   | deploy_Production_Android      |
|                   | deploy_Production_iOS          |
|                   | deploy_Production_Both         |
