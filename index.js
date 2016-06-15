#!/usr/bin/env node

var pm2 = require('pm2');
var pkg = require('./package.json');
var config = require('yargs')
    .usage(pkg.name + ' ' + pkg.version + '\n' + pkg.description + '\n\nUsage: $0 [options]')
    .describe('A', 'check all processes')
    .describe('I', 'Ignore process (may be repeated)')
    .describe('P', 'Process to check (may be repeated)')
    .describe('w', 'Warn if restart count exceeds given value')
    .describe('c', 'Critical if restart count exceeds given value')
    .describe('s', 'Report an error if process is stopped')
    .alias({
        'A': 'all',
        'I': 'ignore',
        'P': 'process',
        'w': 'warn',
        'c': 'crit',
        's': 'stop-error'
    })
    .default({

    })
    .version(pkg.version)
    .help('help')
    .argv;

if (config.ignore && !(config.ignore instanceof Array)) config.ignore = [config.ignore];
if (config.process && !(config.process instanceof Array)) config.process = [config.process];

if (!config.ignore) config.ignore = [];
if (!config.process) config.process = [];

var exit = {
    OK : 0,
    WARNING : 1,
    CRITICAL : 2,
    UNKNOWN : 3
};

if (!config.all && (!config.process || config.process.length === 0)) {
    console.log('check_pm2 options error: you have to supply option -A (--all) or -P (--process)');
    process.exit(exit['UNKNOWN']);
}

var result = 'OK';
var output = '';

var procs = [];

// Connect or launch PM2
pm2.connect(function (err) {

    // Get all processes running
    pm2.list(function (err, process_list) {


        process_list.forEach(function (proc) {
            var env = proc.pm2_env;
            procs.push(proc.name);
            if ((config.all || config.process.indexOf(proc.name) !== -1 ) && config.ignore.indexOf(proc.name) === -1) {

                switch (env.status) {
                    case 'online':
                        if (output !== '') output += ', ';
                        output += proc.name + ' online';
                        break;
                    case 'stopped':
                        if (config.s) {
                            result = 'CRITICAL';
                        } else {
                            if (result !== 'CRITICAL') result = 'WARNING';
                        }
                        if (output !== '') output += ', ';
                        output += proc.name + ' stopped';
                        break;
                    case 'errored':
                        result = 'CRITICAL';
                        if (output !== '') output += ', ';
                        output += proc.name + ' errored';
                        break;
                    default:
                        if (result === 'OK') result = 'UNKNOWN';
                        if (output !== '') output += ', ';
                        output += proc.name + ' ' + env.status;
                }


                if (config.crit && (parseInt(config.crit, 10) < env.restart_time)) {
                    result = 'CRITICAL';
                    if (output !== '') output += ', ';
                    output += proc.name + ' restarted ' + env.restart_time + ' times';
                } else if (config.warn && (parseInt(config.warn, 10) < env.restart_time)) {
                    if (result !== 'CRITICAL') result = 'WARNING';
                    if (output !== '') output += ', ';
                    output += proc.name + ' restarted ' + env.restart_time + ' times';
                }

            }
        });

        if (output === '') output = 'All processes online';

        // Disconnect to PM2
        pm2.disconnect(function () {
            console.log('PM2', result + ':', output);
            process.exit(exit[result]);
        });
    });

});
