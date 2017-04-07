'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.get_race_runner = exports.get_race_leaderboard = exports.get_all_race_codes = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _utils = require('./utils');

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * data.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Contains the scraping functions
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

/**
 * Get a list of all available race codes
 * @returns {Array<string>} 
 */
var get_all_race_codes = exports.get_all_race_codes = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var url, response, contents, $, ids;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:

            console.log('getting latest race ids');

            url = 'http://runraceresults.com/';
            _context.next = 4;
            return (0, _nodeFetch2.default)(url);

          case 4:
            response = _context.sent;
            _context.next = 7;
            return response.text();

          case 7:
            contents = _context.sent;
            $ = _cheerio2.default.load(contents);
            ids = $('td a').map(function (i, elem) {

              if (!elem.attribs['href']) {
                console.log('attrib_', race_id);
              }

              var href_split = elem.attribs['href'].split('=');

              // skip races that have their results saved on different websites
              if (href_split.length < 2) {
                return null;
              }

              return href_split[href_split.length - 1];
            }).get().filter(function (x) {
              return x !== null;
            });
            return _context.abrupt('return', ids);

          case 11:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function get_all_race_codes() {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Get leaderboard url for a specific event and page
 * @param {string} race_id 
 * @param {number} first_record_id
 */
var get_race_leaderboard_url = function get_race_leaderboard_url(race_id, first_record_id) {
  return 'https://www.runraceresults.com/Secure/raceResultsAPI.cfm?do=race%3Aresults%3Aoneclick&EVID=' + race_id + '&RCID=1&SROW=' + first_record_id + '&TYPE=overall';
};

/**
 * Get full race leaderboards for a specific race
 * @param {string} race_id 
 * @returns {Array<Ranking>} collection of runner objects
 */
var get_race_leaderboard = exports.get_race_leaderboard = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(race_id) {
    var url, first_page_response, first_page_content, $, PAGE_SIZE, paging_text_split, number_of_records, number_of_pages, headers, result, _loop, i;

    return regeneratorRuntime.wrap(function _callee2$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:

            // get url of the first page
            url = get_race_leaderboard_url(race_id, 1);

            // fetch first page

            _context3.next = 3;
            return (0, _nodeFetch2.default)(url);

          case 3:
            first_page_response = _context3.sent;
            _context3.next = 6;
            return first_page_response.text();

          case 6:
            first_page_content = _context3.sent;
            $ = _cheerio2.default.load(first_page_content);

            if ($('#result-data tr:nth-child(2) td:nth-child(1)').html()) {
              _context3.next = 11;
              break;
            }

            console.log('no results for ' + race_id);
            return _context3.abrupt('return', []);

          case 11:

            // find out how many pages there are
            PAGE_SIZE = 100;
            paging_text_split = $('#result-data tr:nth-child(2) td:nth-child(1)').html().split(' ');
            number_of_records = parseInt(paging_text_split[paging_text_split.length - 1]);
            number_of_pages = Math.ceil(number_of_records / PAGE_SIZE);


            (0, _utils.log)('start process race ' + race_id + ', pages ' + number_of_pages + ', records ' + number_of_records);

            // determine headers
            headers = $('#result-data:nth-child(2) tr:nth-child(1) td').map(function (_, elem) {
              return elem.children[0].data;
            }).get();

            // process all pages and build result

            result = [headers];
            _loop = regeneratorRuntime.mark(function _loop(i) {
              var record_id, current_page_response, current_page_content, $$, rows;
              return regeneratorRuntime.wrap(function _loop$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:

                      // determine which page to fetch, fetch and process it
                      record_id = i * PAGE_SIZE + 1;
                      _context2.next = 3;
                      return (0, _nodeFetch2.default)(get_race_leaderboard_url(race_id, record_id));

                    case 3:
                      current_page_response = _context2.sent;
                      _context2.next = 6;
                      return current_page_response.text();

                    case 6:
                      current_page_content = _context2.sent;
                      $$ = _cheerio2.default.load(current_page_content);


                      (0, _utils.log)('processing race ' + race_id + ', page: ' + (i + 1) + '/' + number_of_pages + ', record: ' + record_id + '-' + (record_id + 99) + '/' + number_of_records);

                      // will hold the rows for the current page
                      rows = [];

                      // get all relevant <tr>'s - these are the rows on the page

                      $$('#result-data:nth-child(2) tr')
                      // skipping the first because those are always the headers
                      .slice(1)
                      // then extract the data from each row as an array
                      .each(function (j, row) {
                        // select the current row
                        var columns = $$(row)
                        // get all child columns
                        .children('td')
                        // extract the data
                        .map(function (_, row) {
                          return row.children[0].data;
                        })
                        // convert to array
                        .get();

                        // add array to result set for current page
                        rows.push(columns);
                      });

                      // add result set from current page to complete result set
                      result.push.apply(result, rows);

                    case 12:
                    case 'end':
                      return _context2.stop();
                  }
                }
              }, _loop, undefined);
            });
            i = 0;

          case 20:
            if (!(i < number_of_pages)) {
              _context3.next = 25;
              break;
            }

            return _context3.delegateYield(_loop(i), 't0', 22);

          case 22:
            i++;
            _context3.next = 20;
            break;

          case 25:

            (0, _utils.log)('finish process race ' + race_id + ' with ' + number_of_pages + ' pages and ' + (result.length - 1) + ' records');

            return _context3.abrupt('return', result);

          case 27:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function get_race_leaderboard(_x) {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * Get statistics for a runner at a specific race
 * @param {string} race_id 
 * @param {number} bib 
 * @returns {object} object representing the runners details by key and avlue
 */
var get_race_runner = exports.get_race_runner = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(race_id, bib) {
    var url, response, contents, $, runner;
    return regeneratorRuntime.wrap(function _callee3$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            url = 'https://www.runraceresults.com/Secure/raceResultsAPI.cfm?do=race:results:name&ca=&iFrame=undefined&width=undefined';
            _context4.next = 3;
            return (0, _nodeFetch2.default)(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: 'evid=' + race_id + '&rcid=1&firstName=&lastName=&bibNumber=' + bib
            });

          case 3:
            response = _context4.sent;
            _context4.next = 6;
            return response.text();

          case 6:
            contents = _context4.sent;
            $ = _cheerio2.default.load(contents);

            // skip pages that redirect to external websites
            // for instance: https://www.runraceresults.com/Secure/RaceResults.cfm?ID=RCAG2004
            // redirects to: http://portlandmarathon.org/
            // all runraceresults.com pages contain the following id

            if ($('#race-results')) {
              _context4.next = 10;
              break;
            }

            return _context4.abrupt('return', null);

          case 10:

            // the data is always contained as a table within a <td>
            runner = $('#race-results-container td>table').map(function (_, elem) {
              // each <tr> that contains two <td>'s is considered a key value pair
              // convert these pairs to a javascript object
              var obj = elem.children.filter(function (x) {
                return x.type === 'tag';
              }).map(function (x) {
                return x.children.filter(function (y) {
                  return y.type === 'tag';
                });
              }).map(function (tds) {

                // less than 2 or more than 3 <td>s 
                // means it's not a key value pair
                if (tds.length < 2 || tds.length > 3) {
                  return null;
                }

                if (!tds[0].children[0].data) {
                  console.log('data', race_id);
                }

                var key = tds[0].children[0].data.split(':')[0].trim();
                var val = void 0;

                // the value is not always formatted 
                // in the same way

                if (tds[1].children.length === 3) {
                  // example: "3" "out of" "5"

                  val = [
                  // sometimes this field is empty
                  tds[1].children[0].children[0] ? tds[1].children[0].children[0].data : '',
                  // just to be sure perform the empty check here too
                  tds[1].children[1] ? tds[1].children[1].data : '',
                  // some runners are missing the y in "x of y" section
                  tds[1].children[2].children[0] ? tds[1].children[2].children[0].data : ''].join('');
                } else if (!tds[1].children[0]) {

                  return null;
                } else if (tds[1].children[0].name === 'span') {
                  // example: <span>12:43</span>
                  val = tds[1].children[0].children[0].data;
                } else {
                  // the normal case
                  val = tds[1].children[0].data;
                }

                return [key, val];
              }).filter(function (x) {
                return x !== null;
              }).reduce(function (prev, next) {
                return _extends({}, prev, _defineProperty({}, next[0], next[1]));
              }, {});

              if (!obj) {
                (0, _utils.log)('could not process runner for race ' + race_id + ' and bib ' + bib);
                return null;
              }

              return obj;
            }).get().filter(function (x) {
              return x !== null;
            }).reduce(function (prev, next) {
              return _extends({}, prev, next);
            }, {});


            (0, _utils.log)('processed runner for race ' + race_id + ' with bib ' + bib);

            return _context4.abrupt('return', runner);

          case 13:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function get_race_runner(_x2, _x3) {
    return _ref3.apply(this, arguments);
  };
}();
#! /usr/bin/env node
'use strict';

/**
 * Run the application
 * Usage:
 * 0 parameters  => Scrapes all pages
 * 1 parameter   => Scrapes single race with first parameter as race_id
 * 2+ parameters => Scrapes all specified race ids
 */
var main = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var args, arg, remaining_races;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (!(process.argv.length <= 2)) {
                            _context.next = 6;
                            break;
                        }

                        // scrape everything
                        console.log('scraping all pages...');
                        _context.next = 4;
                        return (0, _logic.scrape_all_races)();

                    case 4:
                        _context.next = 23;
                        break;

                    case 6:
                        if (!(process.argv.length > 3)) {
                            _context.next = 12;
                            break;
                        }

                        // scrape multiple races
                        args = process.argv.slice(2);
                        _context.next = 10;
                        return (0, _logic.scrape_races)(args);

                    case 10:
                        _context.next = 23;
                        break;

                    case 12:
                        arg = process.argv[2];

                        if (!(arg === 'test')) {
                            _context.next = 20;
                            break;
                        }

                        _context.next = 16;
                        return (0, _logic.get_remaining_races)();

                    case 16:
                        remaining_races = _context.sent;

                        console.log('Remaining race: ' + remaining_races.join(','));
                        _context.next = 23;
                        break;

                    case 20:
                        // scrape race
                        console.log('scraping race ' + arg);
                        _context.next = 23;
                        return (0, _logic.scrape_race)(arg);

                    case 23:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function main() {
        return _ref.apply(this, arguments);
    };
}();

var _logic = require('./logic');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * run-race-results-scraper script
 */

main();
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.get_remaining_races = exports.scrape_all_races = exports.scrape_races = exports.scrape_race = undefined;

var _data = require('./data');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _utils = require('./utils');

var _csvStringify = require('csv-stringify');

var _csvStringify2 = _interopRequireDefault(_csvStringify);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * logic.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Contains logic to scrape and persist scraped data
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

/**
 * Scrape and save a single race
 * @param {string} race_id 
 */
var scrape_race = exports.scrape_race = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(race_id) {
    var leaderboard, runner_chunks, runners, i, batch, current_tasks, runner_headers, runner_values, runner_csv;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:

            (0, _utils.log)('start process of race ' + race_id);

            _context2.next = 3;
            return (0, _data.get_race_leaderboard)(race_id);

          case 3:
            leaderboard = _context2.sent;

            if (leaderboard) {
              _context2.next = 7;
              break;
            }

            // write file to convey failed scrape on the leaderboard
            _fs2.default.writeFileSync('./output/' + race_id + '_leaderboard.csv', '', 'utf-8');
            // no point in continuing with this race
            return _context2.abrupt('return');

          case 7:

            (0, _csvStringify2.default)(leaderboard, function (_, csv) {
              return _fs2.default.writeFileSync('./output/' + race_id + '_leaderboard.csv', csv, 'utf-8');
            });

            // bach runner collection 8 at a time
            runner_chunks = _.chain(leaderboard).tail().chunk(8).value();
            runners = [];
            i = 0;

          case 11:
            if (!(i < runner_chunks.length)) {
              _context2.next = 28;
              break;
            }

            _context2.prev = 12;
            batch = runner_chunks[i];
            current_tasks = batch.map(function () {
              var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(x) {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return (0, _data.get_race_runner)(race_id, parseInt(x[3]));

                      case 2:
                        return _context.abrupt('return', _context.sent);

                      case 3:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, _callee, undefined);
              }));

              return function (_x2) {
                return _ref2.apply(this, arguments);
              };
            }());
            _context2.t0 = runners;
            _context2.next = 18;
            return Promise.all(current_tasks);

          case 18:
            _context2.t1 = _context2.sent;

            _context2.t0.push.call(_context2.t0, _context2.t1);

            _context2.next = 25;
            break;

          case 22:
            _context2.prev = 22;
            _context2.t2 = _context2['catch'](12);

            (0, _utils.log)(_context2.t2);

          case 25:
            i++;
            _context2.next = 11;
            break;

          case 28:

            runners = _.flatten(runners);

            if (runners.length < 2) {
              // no runner details, create file
              // so that skip logic still works
              _fs2.default.writeFileSync('./output/' + race_id + '_runners_empty.csv', '', 'utf-8');
            }

            // not all objects contain the same keys
            // therefore find all the unique keys
            // then extract values by these keys

            runner_headers = runners.reduce(function (prev, next) {
              return _.union(prev, _.keys(next));
            });
            runner_values = _.chain(runners).map(function (x) {
              return runner_headers.map(function (y) {
                return x[y] || '';
              });
            }).filter(function (x) {
              return !_.isEmpty(x);
            }).value();
            runner_csv = [runner_headers].concat(_toConsumableArray(runner_values));


            (0, _csvStringify2.default)(runner_csv, function (_, csv) {
              return _fs2.default.writeFileSync('./output/' + race_id + '_runners.csv', csv, 'utf-8');
            });

            (0, _utils.log)('finished processing of race ' + race_id);

          case 35:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined, [[12, 22]]);
  }));

  return function scrape_race(_x) {
    return _ref.apply(this, arguments);
  };
}();

var CONCURRENCY = 8;

/**
 * Scrape multiple races
 * @param {Array<string>} race_codes 
 */
var scrape_races = exports.scrape_races = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(race_codes) {
    var tasks, i, current_tasks;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:

            // run 4 at a time
            tasks = _.chunk(race_codes, CONCURRENCY);
            i = 0;

          case 2:
            if (!(i < tasks.length)) {
              _context4.next = 15;
              break;
            }

            _context4.prev = 3;
            current_tasks = tasks[i].map(function () {
              var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(x) {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        _context3.next = 2;
                        return scrape_race(x);

                      case 2:
                        return _context3.abrupt('return', _context3.sent);

                      case 3:
                      case 'end':
                        return _context3.stop();
                    }
                  }
                }, _callee3, undefined);
              }));

              return function (_x4) {
                return _ref4.apply(this, arguments);
              };
            }());
            _context4.next = 7;
            return Promise.all(current_tasks);

          case 7:
            _context4.next = 12;
            break;

          case 9:
            _context4.prev = 9;
            _context4.t0 = _context4['catch'](3);

            (0, _utils.log)(_context4.t0);

          case 12:
            i++;
            _context4.next = 2;
            break;

          case 15:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined, [[3, 9]]);
  }));

  return function scrape_races(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

/**
 * Scrapes all races and saves the results
 */
var scrape_all_races = exports.scrape_all_races = function () {
  var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
    var _ref6, race_codes, counted_unique;

    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            (0, _utils.log)('start process of all races');

            _context5.next = 3;
            return get_remaining_races();

          case 3:
            _ref6 = _context5.sent;
            race_codes = _ref6.races_remaining;
            counted_unique = _ref6.counted_unique;


            (0, _utils.log)(counted_unique.length + ' races already processed. ' + races_remaining.length + ' races remaining');

            _context5.next = 9;
            return scrape_races(race_codes);

          case 9:

            (0, _utils.log)('finished processing of all races');

          case 10:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, undefined);
  }));

  return function scrape_all_races() {
    return _ref5.apply(this, arguments);
  };
}();

var get_remaining_races = exports.get_remaining_races = function () {
  var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6() {
    var race_codes, files, counted, counted_unique, races_remaining;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return (0, _data.get_all_race_codes)();

          case 2:
            race_codes = _context6.sent;


            // races that are already scraped should be skipped
            files = _fs2.default.readdirSync('./output').map(function (x) {
              return x.split('_')[0];
            });

            // there should be two files per race
            // filter out those that have two files

            counted = files.filter(function (x) {
              var count = files.filter(function (y) {
                return y === x;
              }).length;
              return count >= 2;
            });

            // remove duplicates, these are the 
            // races that have previously been processed

            counted_unique = _.uniq(counted);

            // only scrape those races that arent processed

            races_remaining = race_codes.filter(function (x) {
              return !counted_unique.includes(x);
            });
            return _context6.abrupt('return', {
              races_remaining: races_remaining,
              counted_unique: counted_unique
            });

          case 8:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, undefined);
  }));

  return function get_remaining_races() {
    return _ref7.apply(this, arguments);
  };
}();
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * models.js
 * Contains all the models used throughout the script
 */

var LeaderboardRanking = exports.LeaderboardRanking = function LeaderboardRanking() {
  _classCallCheck(this, LeaderboardRanking);

  this.place = '';
  this.name = '';
  this.location = '';
  this.bib = 0;
  this.net_time = '';
  this.pace = '';
  this.division_place = '';
  this.sex_age = '';
  this.sex_place = '';
  this.gun_time = '';
  this.age_grade = '';
};
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * utils.js
 * Various utilities
 */

var LOGGING = true;

var log = exports.log = function log(message) {
  if (!LOGGING) return;
  console.log(message);
};
