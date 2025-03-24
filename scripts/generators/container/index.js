/**
 * Container Generator
 */

const reduxExists = require('../utils/reduxExists.js');

module.exports = {
  description: 'Add a container component',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'What should it be called?',
      default: 'Home',
      validate: value => {
        if (/.+/.test(value)) {
          return reduxExists(value)
            ? 'A Redux logic with this name already exists'
            : true;
        }

        return 'The name is required';
      },
    },
  ],
  actions: data => {
    const actions = [
      {
        type: 'add',
        path: '../../src/store/{{properCase name}}/action.js',
        templateFile: './container/actions.js.hbs',
        abortOnFail: true,
      },
      {
        type: 'add',
        path: '../../src/store/{{properCase name}}/reducer.js',
        templateFile: './container/reducer.js.hbs',
        abortOnFail: true,
      },
      {
        type: 'add',
        path: '../../src/store/{{properCase name}}/constants.js',
        templateFile: './container/constants.js.hbs',
        abortOnFail: true,
      },
      {
        type: 'add',
        path: '../../src/store/{{properCase name}}/module.js',
        templateFile: './container/module.js.hbs',
        abortOnFail: true,
      },
      {
        type: 'add',
        path: '../../src/store/{{properCase name}}/selector.js',
        templateFile: './container/selector.js.hbs',
        abortOnFail: true,
      },
      {
        type: 'add',
        path: '../../src/store/{{properCase name}}/saga.js',
        templateFile: './container/saga.js.hbs',
        abortOnFail: true,
      },
    ];

    actions.push({
      type: 'prettify',
      path: '/store/',
    });

    return actions;
  },
};
