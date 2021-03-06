const {Command} = require('../../..');

module.exports = class ScaffoldModelCommand extends Command {
  static description = 'Scaffold a model';

  static path = 'scaffold:model';

  async run() {
    this.log('Scaffolded');
  }
};
