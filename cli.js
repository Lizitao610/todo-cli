#!/usr/bin/env node
const program = require('commander');
const api = require('./index.js')
const pkg = require('./package.json')

program
    .version(pkg.version, '-v --vers', 'output the current version')
program
    .command('add')
    .description('add a task')
    .action((source, destination) => {
        api.add(destination.join(' ')).then(() => { console.log('添加成功') }, (error) => { console.log(error) })
    });
program
    .command('clear')
    .description('clear all tasks')
    .action((source, destination) => {
        api.clear().then(() => { console.log('清除成功') }, (error) => { console.log(error) })
    });

if (process.argv.length === 2) {
    api.showAll().then(null, (error) => { console.log(error) })
}

program.parse(process.argv);
