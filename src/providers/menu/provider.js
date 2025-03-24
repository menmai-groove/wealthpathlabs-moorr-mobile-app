import HamburgerMenu from 'assets/jsons/hamburger-menu';
import { AppScreenID } from 'constant';
import { cloneDeep } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectFlags } from 'store/Auth/selector';

import Context from './context';

const updateTreeData = (key, id, hidden) => obj => {
  if (obj[key] === id) {
    obj.hidden = hidden;
    return true;
  } else if (obj.children) {
    return obj.children.some(updateTreeData(key, id, hidden));
  }
};

const menusData = HamburgerMenu.data;

function MenuProvider({ children }) {
  const [currentRoute, setStateCurrentRoute] = useState('');
  const [path, setStatePath] = useState('');
  const [menuOpened, setStateMenuOpened] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(true);
  const flags = useSelector(selectFlags);

  const findPath = useCallback((id, treeData = menusData, pathStack = []) => {
    let data = null;
    for (let i = 0; i < treeData.length; i++) {
      const { id: route, children: subMenus, label, hidden = false } = treeData[i];
      if (route === id) {
        const paths = pathStack.concat(id);
        return {
          id,
          label,
          hidden,
          stack: paths,
          path: paths.join('/'),
        };
      }
      if (subMenus && subMenus.length) {
        data = findPath(id, subMenus, pathStack.concat(route));
        if (data) {
          return data;
        }
      }
    }
    return data;
  }, []);

  useEffect(() => {
    // update path when re open menu
    if (currentRoute) {
      const newPath = findPath(currentRoute);
      setButtonVisible(newPath?.stack?.length > 0 || currentRoute === AppScreenID.Webview);
    }
  }, [currentRoute, findPath]);

  const getActiveRouteState = useCallback(route => {
    if (!route?.routes?.length) {
      return route;
    }

    const childActiveRoute = route.routes[route.index];
    if (childActiveRoute?.state) {
      return getActiveRouteState(childActiveRoute.state);
    }
    return childActiveRoute;
  }, []);

  const setPath = useCallback(newPath => {
    setStatePath(newPath);
  }, []);

  const setMenuOpened = useCallback(opened => {
    setStateMenuOpened(opened);
  }, []);

  const setCurrentRoute = useCallback(routeName => {
    setStateCurrentRoute(routeName);
  }, []);

  const newContext = useMemo(() => {
    let cloneMenusData;
    cloneMenusData = cloneDeep(menusData);
    if (!flags?.wealthSpeedMenuVisible) {
      cloneMenusData.forEach(updateTreeData('id', AppScreenID.WealthDashboard, true));
    }
    if (!flags?.expenseDashboardVisible) {
      cloneMenusData.forEach(updateTreeData('id', AppScreenID.ExpenseDashboard, true));
    }
    if (!flags?.myknowledgeMobile) {
      cloneMenusData.forEach(updateTreeData('id', 'myknowledge', true));
    }

    cloneMenusData = cloneMenusData.filter(x => !x.hidden);
    return {
      menuItems: cloneMenusData,
      currentRoute,
      path,
      menuOpened,
      buttonVisible,
      findPath,
      setPath,
      setMenuOpened,
      setCurrentRoute,
      getActiveRouteState,
      setButtonVisible,
    };
  }, [
    currentRoute,
    path,
    menuOpened,
    buttonVisible,
    findPath,
    setCurrentRoute,
    setPath,
    setMenuOpened,
    getActiveRouteState,
    setButtonVisible,

    flags,
  ]);

  return <Context.Provider value={newContext}>{children}</Context.Provider>;
}

export default MenuProvider;
