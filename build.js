#!/usr/bin/env node
require('./setup');
const process = require('process');
const minimist = require('minimist');
const LastStep = require('./dist/main').LastStep;

const parseArgv = () => {
  let argv = minimist(process.argv.slice(2), {
    alias: {
      // .last-step.js config file
      'c': 'config',
      'w': 'watch'
    },
    default: {
      'c': '.last-step.js'
    },
    string: [ 'c' ],
    boolean: [ 'w' ]
  });
  return argv;
}

(() => {
  let { w: watch, c: userFile } = parseArgv();
  let lastStep = new LastStep({ watch, userFile });
  let promise = lastStep.run();
  let exit = () => {
    console.log(''); // Add a new line after '^C'
    console.log('Interrupt received...');
    lastStep.interrupt();
    promise
      .then(() => {
        console.log('Bye!');
        process.exit(0);
      })
      .catch(() => {
        process.exit(1);
      });
  }
  process.on('SIGTERM', exit);
  process.on('SIGINT', exit);
})();
