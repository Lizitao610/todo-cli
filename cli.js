#!/usr/bin/env node
const program = require('commander');
const api = require('./index.js')
const pkg = require('./package.json')

program
    .version(pkg.version, '-v --vers', 'output the current version')
program
    .command('add')
    .description('add tasks')
    .action(() => {
        api.createTask()
    });
program
    .command('clear')
    .description('clear all tasks')
    .action(() => {
        api.clear().then(() => { console.log('\n清除成功！\n') }, (error) => { console.log(error) })
    });

if (process.argv.length === 2) {
    api.showAll().then(null, (error) => { console.log(error) })
}

program.parse(process.argv);
