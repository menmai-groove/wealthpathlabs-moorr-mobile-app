/**
 * Component Generator
 */

/* eslint strict: ["off"] */

'use strict';

const componentExists = require('../utils/componentExists');

module.exports = {
  description: 'Add an unconnected component',
  prompts: [
    {
      type: 'list',
      name: 'type',
      message: 'Select the type of component',
      default: 'Stateless Function',
      choices: () => ['Stateless Function', 'React.Component'],
    },
    {
      type: 'input',
      name: 'name',
      message: 'What should it be called?',
      default: 'Button',
      validate: value => {
        if (/.+/.test(value)) {
          return componentExists(value)
            ? 'A component or screen with this name already exists'
            : true;
        }

        return 'The name is required';
      },
    },
  ],
  actions: data => {
    let screenTemplate;
    // Generate index.js and index.test.js
    switch (data.type) {
      case 'Stateless Function': {
        screenTemplate = './screen/stateless.js.hbs';
        break;
      }
      default: {
        screenTemplate = './screen/class.js.hbs';
      }
    }

    const actions = [
      {
        type: 'add',
        path: '../../src/screens/{{properCase name}}/index.js',
        templateFile: screenTemplate,
        abortOnFail: true,
      },
      {
        type: 'add',
        path: '../../src/screens/{{properCase name}}/style.js',
        templateFile: './screen/style.js.hbs',
        abortOnFail: true,
      },
    ];

    actions.push({
      type: 'prettify',
      path: '/screens/',
    });

    return actions;
  },
};
