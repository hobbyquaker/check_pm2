# check_pm2


[![npm version](https://badge.fury.io/js/check_pm2.svg)](https://badge.fury.io/js/check_pm2) 
[![License][mit-badge]][mit-url]


Nagios/Icinga Plugin to check [PM2](https://github.com/Unitech/pm2) Processes

## Installation

Needs Node.js/npm

```npm install check_pm2 -g```


## Usage

```
check_pm2 [options]

Options:
  -A, --all         check all processes
  -I, --ignore      Ignore process (may be repeated)
  -P, --process     Process to check (may be repeated)
  -w, --warn        Warn if restart count exceeds given value
  -c, --crit        Critical if restart count exceeds given value
  -s, --stop-error  Report an error if process is stopped
  --version         Show version number                                [boolean]
  --help            Show help                                          [boolean]
```

Mind that check_pm2 has to be run under the same user that started the PM2 daemon.

## License

MIT (c) Sebastian Raff

[mit-badge]: https://img.shields.io/badge/License-MIT-blue.svg?style=flat
[mit-url]: LICENSE