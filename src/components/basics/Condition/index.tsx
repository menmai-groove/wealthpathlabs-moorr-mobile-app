/**
 *
 * Condition
 *
 */

import * as React from 'react';
import { View } from 'react-native';

export interface ICondition {
  display: boolean;
  children: React.ReactNode;
}

function Condition({ display, children }: ICondition) {
  if (display) {
    return <>{children}</>;
  }
  return <View />;
}

Condition.propTypes = {};

export default Condition;
