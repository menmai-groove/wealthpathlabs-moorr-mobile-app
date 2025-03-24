/**
 * Unit Test Generator
 */
const fs = require('fs');
const _ = require('lodash');
const componentExists = require('../utils/componentExists');

const importActionText = listAction => `import {
  ${listAction},
} from '../actions';

`;

const importSelectorsText = listSelectors => `import { fromJS } from 'immutable';
import {
  ${listSelectors},
} from '../selectors';
import { initialState } from '../reducer';

`;

const importConstantsText = listConstants => `import {
  ${listConstants},
} from '../constants';

`;

const importReducerText = reducer => `import ${reducer}, { initialState as state } from '../reducer';

`;

const testSuitActionText = (action, type) => `describe('${_.join(
  _.map(_.split(_.kebabCase(action), '-'), str => _.upperFirst(str)),
  ' ',
)} action', () => {
  it('should return the correct action object', () => {
    expect(${action}()).toEqual({
      type: ${type},
    });
  });
});
`;

const testSuitSelectorText = (
  domain,
  selector,
  getDomain,
) => `describe('Test ${selector}', () => {
  const ${selector}Maker = ${selector}();
  it('should return ${_.join(
    _.map(
      _.filter(
        _.split(_.kebabCase(selector), '-'),
        str => _.indexOf(['select', 'selector', 'make'], str) === -1,
      ),
      str => _.upperFirst(str),
    ),
    ' ',
  )} state', () => {
    const mockedState = fromJS({
      ${domain}: initialState.toJS(),
    });
    expect(${selector}Maker(mockedState)).toEqual(
      initialState${getDomain}
    );
  });
});
`;

const testSuitReducerText = (
  domain,
  constants,
  getDomain,
) => `describe('Test ${domain} for action ${constants}', () => {
  it('should return correct state when receive ${constants} action', () => {
    const action = {
      type: ${constants},
    }
    expect(${domain}(state, action)).toEqual(
      ${getDomain}
    );
  });
});
`;

module.exports = {
  description: 'Add a Unit test',
  prompts: [
    {
      type: 'input',
      name: 'container',
      message: 'Which container you want to generate unit test for?',
      default: 'UnmatchedProduct',
      validate: value => {
        if (/.+/.test(value)) {
          return !componentExists(value)
            ? 'A container with this name is not exists'
            : true;
        }

        return 'The name is required';
      },
    },
    {
      type: 'list',
      name: 'test',
      message:
        'Select type of test. The current test file in this forder will be over writed',
      choices: () => ['actions', 'reducer', 'selectors'],
    },
  ],

  actions: ans => {
    const actions = [];
    actions.push(data => {
      let file;
      let listAction;
      let listReducer;
      let listConstants;
      let listSelectors;
      let regex;
      let domain = _.camelCase(data.container);
      const folderPath = `${__dirname}/../../../src/containers/${data.container}`;
      switch (data.test) {
        case 'actions':
          file = fs.readFileSync(`${folderPath}/actions.js`, {
            encoding: 'utf8',
          });
          regex = /const \w+ = \(?.*\)? =>/g;
          listAction = _.map(file.match(regex), str => _.split(str, ' ')[1]);

          regex = /type: \w+/g;
          listConstants = _.map(file.match(regex), str => _.split(str, ' ')[1]);

          fs.writeFileSync(
            `${folderPath}/tests/actions.test.js`,
            importActionText(listAction.join(',\n')),
          );
          fs.appendFileSync(
            `${folderPath}/tests/actions.test.js`,
            importConstantsText(listConstants.join(',\n')),
          );
          _.each(listAction, (str, index) => {
            fs.appendFileSync(
              `${folderPath}/tests/actions.test.js`,
              testSuitActionText(str, listConstants[index]),
            );
          });
          break;

        case 'reducer':
          file = fs.readFileSync(`${folderPath}/reducer.js`, {
            encoding: 'utf8',
          });
          regex = /case \w+/g;
          listReducer = _.map(file.match(regex), str => _.split(str, ' ')[1]);

          regex = /return state(\n?.+(set|setIn)\(\n?.+\n?\))*/g;
          listConstants = _.map(file.match(regex), str =>
            _.trimStart(str, 'return '),
          );

          domain = _.camelCase(`${data.container}Reducer`);
          fs.writeFileSync(
            `${folderPath}/tests/reducer.test.js`,
            importReducerText(domain),
          );
          fs.appendFileSync(
            `${folderPath}/tests/reducer.test.js`,
            importConstantsText(listReducer.join(',\n')),
          );
          _.each(listReducer, (str, index) => {
            fs.appendFileSync(
              `${folderPath}/tests/reducer.test.js`,
              testSuitReducerText(domain, str, listConstants[index]),
            );
          });
          break;

        case 'selectors':
          file = fs.readFileSync(`${folderPath}/selectors.js`, {
            encoding: 'utf8',
          });
          regex = /const \w+ = \(?.*\)? =>/g;
          listSelectors = _.map(file.match(regex), str => _.split(str, ' ')[1]);

          regex = /\.get\('\w+'\)/g;
          listConstants = file.match(regex);

          fs.writeFileSync(
            `${folderPath}/tests/selectors.test.js`,
            importSelectorsText(listSelectors.join(',\n')),
          );
          fs.appendFileSync(
            `${folderPath}/tests/selectors.test.js`,
            `describe('${listSelectors[0]}', () => {
              it('Expect to return ${domain}', () => {
                const mockedState = fromJS({
                  ${domain}: initialState,
                });
                expect(${listSelectors[0]}(mockedState)).toEqual(initialState);
              });
            });
            `,
          );
          _.each(
            _.takeRight(listSelectors, listSelectors.length - 1),
            (str, index) => {
              fs.appendFileSync(
                `${folderPath}/tests/selectors.test.js`,
                testSuitSelectorText(domain, str, listConstants[index]),
              );
            },
          );
          break;
        default:
          break;
      }
    });
    actions.push({
      type: 'prettify',
      path: `/containers/${ans.container}/tests/`,
    });
    return actions;
  },
};
