const {MultiSelect} = require('../../dist/react');
const SelectCommand = require('./SelectCommand');

module.exports = class MultiSelectCommand extends SelectCommand {
  static description = 'Test `MultiSelect` component';

  static path = 'multiselect';

  getComponent() {
    return MultiSelect;
  }
};
