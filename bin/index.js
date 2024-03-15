#! /usr/bin/env node
const chalk = require('chalk')
const boxen = require('boxen')
const yargs = require("yargs");
const figlet = require('figlet');
const argv = require('yargs/yargs')(process.argv.slice(2)).argv;
const fsPromise  =  require('fs').promises;
const fs = require('fs');
const capitalize = require('lodash.capitalize');

const usage = chalk.keyword('violet')("\nUsage: my-mycli -u <use> \n"
+ boxen(chalk.green("\n" + "Create dinamicly components" + "\n"), {padding: 1, borderColor: 'green', dimBorder: true}) + "\n");
yargs
      .usage(usage)
      .option("u", {alias:"use", describe: "Name of yor use case", type: "string", demandOption: false })
      .example('mycli -u user/createUserUseCase')
      .help(true)
      .version()
      .argv;

const useCase =  argv.u  || argv.use;

if( !useCase ){

    console.log(
        chalk.yellow(
          figlet.textSync('ComponsCLI', { horizontalLayout: 'full' })
        )
      );
    yargs.showHelp();
    return;
}

const ROUTE_FILE = (component)  => `
const express = require('express');

const ${component}Router = express.Router();

module.exports = ${component}Router;
`;

const CONTROLLER_FILE = (fileName) => `
class ${capitalize(fileName)}Controller {
  constructor() {
  }
}

module.exports = ${capitalize(fileName)}Controller;
`;

const SERVICE_FILE = (fileName) => `
class ${capitalize(fileName)}Service {
  modelRepository;

  constructor(modelRepository) {
    this.modelRepository = modelRepository;
  }
}

module.exports = ${capitalize(fileName)}Service;
`;

const DTO_FILE = (fileName) => `
const Joi = require('joi');

const ${fileName}Schema = Joi.object({
});

`;

const INDEX_USE_CASE_FILE = (fileName) => `
const ${capitalize(fileName)}Controller = require('./${fileName}.controller');
const ${capitalize(fileName)}Service = require('./${fileName}.service');

const ${fileName}Service = new ${capitalize(fileName)}Service();

module.exports = {
  ${capitalize(fileName)}Controller,
  ${fileName}Service,
};
`;
const init = async () => {
  try {
    const path = 'src/components/';
    const pathUseCase = `${path}${useCase}/`;
    const component = useCase?.split('/')[0];
    const fileName = useCase?.split('/')[1];
    const filesNames = fileName?.substring(0, fileName?.indexOf('UseCase'));

    if(fs.existsSync(pathUseCase)) return console.log('CASO DE USO EXISTENTE');

    const directory = await fsPromise.mkdir(pathUseCase, { recursive: true });
    if ( directory ) {
      const dirForRoutes = `${path}/${component}/routes`;
      if( !fs.existsSync(dirForRoutes) ) {
        const routeFolder = await fsPromise.mkdir(dirForRoutes, { recursive: true });
        if(routeFolder) await fsPromise.writeFile(`${dirForRoutes}/index.js`, ROUTE_FILE(capitalize(component)), {
          encoding: 'utf-8'
        });
      }
      const dirForDto = `${pathUseCase}/dto`;
      if (await fsPromise.mkdir(dirForDto, { recursive: true })) {
        await fsPromise.writeFile(`${dirForDto}/${filesNames}.request.js`, DTO_FILE(filesNames));
      }
      await fsPromise.writeFile(`${pathUseCase}/${filesNames}.controller.js`, CONTROLLER_FILE(filesNames));
      await fsPromise.writeFile(`${pathUseCase}/${filesNames}.service.js`, SERVICE_FILE(filesNames));
      await fsPromise.writeFile(`${pathUseCase}/index.js`, INDEX_USE_CASE_FILE(filesNames));

    }
    
  } catch (error) {
    console.error(error);
  }

}

init();


