import { CommonActions, DrawerActions, StackActions, TabActions } from '@react-navigation/native';

let navigator;
let opened = false;

function setTopLevelNavigator(navigatorRef) {
  navigator = navigatorRef;
}

function navigate(name, params) {
  if (opened) {
    return;
  }
  opened = true;
  navigator.dispatch(
    CommonActions.navigate({
      name,
      params,
    }),
  );
  setTimeout(() => {
    opened = false;
  }, 500);
}

function push(name, params) {
  navigator.dispatch(StackActions.push(name, params));
}

function pop(key) {
  if (key) {
    navigator.dispatch({ ...CommonActions.goBack(), source: key });
  } else {
    navigator.dispatch(CommonActions.goBack());
  }
}

function reset(name, params = {}) {
  navigator.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [
        {
          name,
          params,
        },
      ],
    }),
  );
}

function jumpTo(name, params = {}) {
  navigator.dispatch(TabActions.jumpTo(name, params));
}

function getCurrentRoute() {
  if (navigator && navigator.getCurrentRoute) {
    return navigator.getCurrentRoute().name;
  }
  return '';
}

function toggleDrawer() {
  navigator.dispatch(DrawerActions.toggleDrawer());
}

function openDrawer() {
  navigator.dispatch(DrawerActions.openDrawer());
}

function closeDrawer() {
  navigator.dispatch(DrawerActions.closeDrawer());
}

// add other navigation functions that you need and export them

// remove screen and reset screent to end of stack
function removeScreen(name) {
  navigator.dispatch(state => {
    const routes = state.routes.filter(x => x.name !== name);
    return CommonActions.reset({
      ...state,
      routes,
      index: routes.length - 1,
    });
  });
}

export default {
  pop,
  reset,
  navigate,
  setTopLevelNavigator,
  toggleDrawer,
  openDrawer,
  closeDrawer,
  push,
  jumpTo,
  getCurrentRoute,
  removeScreen,
};
