import React from 'react';
import { DynamicModuleLoader } from 'redux-dynamic-modules';

const withDynamicModuleLoader = modules => WrappedComponent => {
  const modulesArray = Array.isArray(modules) ? modules : [modules];

  return props => (
    <DynamicModuleLoader modules={modulesArray}>
      <WrappedComponent {...props} />
    </DynamicModuleLoader>
  );
};

export default withDynamicModuleLoader;
