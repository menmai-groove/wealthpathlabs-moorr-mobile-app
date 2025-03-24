import Aim from 'assets/svgs/menu/aim';
import ArrowDown from 'assets/svgs/menu/arrowDown';
import ArrowRight from 'assets/svgs/menu/arrowRight';
import Bug from 'assets/svgs/menu/bug';
import Financial from 'assets/svgs/menu/financial';
import Home from 'assets/svgs/menu/home';
import Money from 'assets/svgs/menu/money';
import MyKnowledge from 'assets/svgs/menu/myKnowledge';
import Accordion from 'components/basics/Accordion';
import TextField from 'components/basics/TextField';
import { AppScreenID } from 'constant';
import get from 'lodash/get';
import { useThemedStyle } from 'providers';
import { useMenu } from 'providers/menu/consumer';
import React, { memo, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import themedStyles from './style';

const i18nScope = 'components.avatar';

const MemoizedMenu = memo(
  ({
    key,
    accordionStyle,
    active = false,
    selected = false,
    menu,
    newId,
    level = 0,
    id = '',
    onPressMenu = () => {},
    renderIcon = () => {},
    handleToggle = () => {},
  }) => {
    const styles = useThemedStyle(themedStyles, i18nScope);
    const hasChildren = useMemo(() => {
      return menu.children && menu.children.filter(item => !item.hidden).length > 0;
    }, [menu]);
    const params = get(menu, 'params');

    return (
      <Accordion
        key={key}
        id={level}
        style={accordionStyle}
        leftIcon={() =>
          menu.icon &&
          (menu.iconHasBG ? (
            <View
              style={[
                styles.box,
                active && hasChildren && styles.activeBox,
                active && hasChildren && styles.childrenIconContainer,
                selected && styles.activeBox,
                selected && styles.activeIconContainer,
              ]}>
              {renderIcon({ active: selected, icon: menu.icon })}
            </View>
          ) : (
            renderIcon({ active: selected, icon: menu.icon })
          ))
        }
        title={() => {
          return (
            <View style={styles.row}>
              <TextField
                style={[styles.labelText, selected && accordionStyle.expandTitleTextStyle]}
                type="paragraph-2"
                font="medium">
                {menu.label}
              </TextField>
            </View>
          );
        }}
        value={hasChildren ? active : selected}
        onChange={value => handleToggle(value, id, menu, params)}
        rightIcon={() => {
          if (hasChildren) {
            return active ? <ArrowDown /> : <ArrowRight />;
          }
          return null;
        }}>
        {hasChildren && (
          <AccordionTree
            id={newId}
            level={level + 1}
            items={menu.children}
            onPressMenu={onPressMenu}
          />
        )}
      </Accordion>
    );
  },
);

const Menu = memo(props => {
  const { currentRoute, path, findPath } = useMenu();
  const { stack: routeStack, hidden: hiddenRoute } = findPath(currentRoute) || {};
  const activeStack = path?.split('/') || [];
  const selected =
    props.menu.id === currentRoute ||
    (hiddenRoute && routeStack.length > 2 && routeStack.slice(-2)[0] === props.menu.id) ||
    (props.menu.id === 'myknowledge' && currentRoute === AppScreenID.Webview);
  const active = props.menu.id === currentRoute || activeStack.includes(props.menu.id);

  return useMemo(() => {
    // The rest of your rendering logic
    return <MemoizedMenu {...props} active={active} selected={selected} />;
  }, [props, active, selected]);
});

const AccordionTree = memo(({ level = 0, id = '', items = [], onPressMenu = () => {} }) => {
  const styles = useThemedStyle(themedStyles, i18nScope);

  const renderIcon = useCallback(
    ({ active, icon }) => {
      switch (icon) {
        case 'Home':
          return <Home active={active} />;
        case 'Money':
          return <Money />;
        case 'Financial':
          return <Financial active={active} />;
        case 'Aim':
          return <Aim active={active} />;
        case 'MyKnowledge':
          return <MyKnowledge active={active} />;
        case 'Bug':
          return <Bug />;
        case 'ArrowRight2':
          return (
            <FontAwesome5Icon
              name="play"
              size={8}
              color={active ? styles.activePlayIcon.color : styles.playIcon.color}
            />
          );
        case 'Wealth':
          return (
            <MaterialIcons
              name="speed"
              size={20}
              color={active ? styles.activeWealthIcon.color : styles.wealthIcon.color}
            />
          );
        default:
          return null;
      }
    },
    [styles],
  );
  const handleToggle = useCallback(
    (visible = false, parentId = '', menu, params) => {
      const hasChildren = menu.children && menu.children.filter(item => !item.hidden).length > 0;
      if (visible) {
        onPressMenu({
          visible,
          id: menu.id,
          path: parentId ? `${parentId}/${menu.id}` : menu.id,
          hasChildren: hasChildren,
          params,
        });
        return;
      }

      onPressMenu({
        visible,
        id: menu.id,
        path: parentId,
        hasChildren: hasChildren,
        params,
      });

      // const fullPath = findPath(currentRoute, menuItems);
      // if (fullPath?.stack?.length > 0 && fullPath?.stack?.includes(menu.id)) {
      //   onPressMenu({
      //     visible,
      //     id: menu.id,
      //     path:
      //       fullPath?.stack?.length > 0
      //         ? fullPath.path
      //         : parentId
      //         ? `${parentId}/${menu.id}`
      //         : menu.id,
      //     hasChildren: hasChildren,
      //   });
      // } else {
      //   onPressMenu({
      //     visible,
      //     id: menu.id,
      //     path: parentId,
      //     hasChildren: hasChildren,
      //   });
      // }
    },
    [onPressMenu],
  );

  const renderMenus = () => {
    return items.map((menu, i) => {
      if (menu.hidden) {
        return null;
      }
      const newId = id ? `${id}/${menu.id}` : menu.id;
      const hasChildren = menu.children && menu.children.filter(item => !item.hidden).length > 0;
      const accordionStyles = {
        0: {
          titleStyle: {
            paddingLeft: 10,
            paddingRight: 10,
          },
          accordionStyle: {
            backgroundColor: 'transparent',
            borderRadius: 12,
            padding: 0,
            marginVertical: 10,
            marginLeft: 10,
          },
          expandAccordionStyle: {
            backgroundColor: hasChildren ? 'palette.color-white-3' : 'palette.color-primary-1',
            marginLeft: 0,
            paddingLeft: 10,
          },
          expandTitleTextStyle: hasChildren ? {} : { color: 'palette.color-white-1' },
          rightIcon: {
            paddingRight: 20,
          },
          children: { paddingBottom: 10 },
        },
        1: {
          titleStyle: {
            paddingRight: 10,
            paddingLeft: 10,
          },
          accordionStyle: {
            backgroundColor: 'transparent',
            padding: 0,
            marginVertical: 0,
            marginLeft: 20,
          },
          expandAccordionStyle: {
            backgroundColor: hasChildren ? 'palette.color-white-1' : 'palette.color-primary-1',
            paddingLeft: 5,
            marginLeft: 0,
            marginRight: 10,
          },
          expandTitleTextStyle: hasChildren ? {} : { color: 'palette.color-white-1' },
          rightIcon: {
            paddingRight: 20,
          },
          children: { paddingBottom: 10 },
          expandRightIcon: {
            paddingRight: 10,
          },
        },
        2: {
          titleStyle: {
            paddingLeft: 10,
          },
          accordionStyle: {
            backgroundColor: 'transparent',
            borderRadius: 12,
            padding: 0,
            marginVertical: 0,
            marginLeft: 30,
            marginRight: 10,
          },
          expandAccordionStyle: {
            backgroundColor: hasChildren ? 'palette.color-white-1' : 'palette.color-primary-1',
            marginLeft: 5,
            paddingLeft: 15,
          },
          expandTitleTextStyle: hasChildren ? {} : { color: 'palette.color-white-1' },
          children: { paddingBottom: 10 },
        },
      };
      const getAccordionStyle = levelInput => accordionStyles[levelInput];
      const accordionStyle = getAccordionStyle(level);
      const menuProps = {
        accordionStyle,
        menu,
        newId,
        level,
        id,
        onPressMenu,
        renderIcon,
        handleToggle,
      };
      return <Menu key={`accordion-${i}`} {...menuProps} />;
    });
  };

  return <View>{renderMenus()}</View>;
});

const AccordionMenu = memo(({ onPressMenu = () => {} }) => {
  const { menuItems } = useMenu();
  return <AccordionTree items={menuItems} onPressMenu={onPressMenu} />;
});

export default AccordionMenu;
