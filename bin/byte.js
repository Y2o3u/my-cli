#!/usr/bin/env node

const program = require('commander')

program
    .version('1.0.0')
    .command('create <project-name>', 'create demo project')
    .parse(process.argv)