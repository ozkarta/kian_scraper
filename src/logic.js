/**
 * logic.js
 * Contains logic to scrape and persist scraped data
 */

import {
  get_race_runner,
  get_all_race_codes,
  get_race_leaderboard,
} from './data'

import fs from 'fs'
import * as _ from 'lodash'
import { log } from './utils'
import csv_stringify from 'csv-stringify'

/**
 * Scrape and save a single race
 * @param {string} race_id 
 */
export const scrape_race = async (race_id: string) => {

  log(`start process of race from URL:  ${race_id}`)

  const race_name = get_race_name(race_id);  

  const leaderboard = await get_race_leaderboard(race_id)

  if (!leaderboard) {
    // write file to convey failed scrape on the leaderboard
    fs.writeFileSync(
      `./output/${race_name}_leaderboard.csv`,
      '',
      'utf-8'
    )
    // no point in continuing with this race
    return
  }

  csv_stringify(leaderboard, (_, csv) => fs.writeFileSync(
    `./output/${race_name}_leaderboard.csv`,
    csv,
    'utf-8'
  ))

  // bach runner collection 8 at a time
  const runner_chunks = _
    .chain(leaderboard)
    .tail()
    .chunk(8)
    .value()

  let runners = []
  


  for (let i = 0; i < runner_chunks.length; i++) {

    try {

      const batch = runner_chunks[i]

      //  Ozzy:  => changed x[3] to x[0];  BIB  did not match in Array
      const current_tasks = batch
        .map(async x => await get_race_runner(race_id, parseInt(x[0]))
        )

      runners.push(await Promise.all(current_tasks))

    } catch (err) {
      log(err)
    }

  }

  runners = _.flatten(runners)

  if (runners.length < 2) {
    // no runner details, create file
    // so that skip logic still works
    fs.writeFileSync(
      `./output/${race_name}_runners_empty.csv`,
      '',
      'utf-8'
    )
  }

  // not all objects contain the same keys
  // therefore find all the unique keys
  // then extract values by these keys

  const runner_headers = runners
    .reduce((prev, next) => _.union(prev, _.keys(next)))

  const runner_values = _
    .chain(runners)
    .map(x => runner_headers.map(y => x[y] || ''))
    .filter(x => !_.isEmpty(x))
    .value()

  const runner_csv = [runner_headers, ...runner_values]

  csv_stringify(runner_csv, (_, csv) => fs.writeFileSync(
    `./output/${race_name}_runners.csv`,
    csv,
    'utf-8'
  ))

  log(`finished processing of race ${race_name}`)
}

const CONCURRENCY = 8

/**
 * Scrape multiple races
 * @param {Array<string>} race_codes 
 */
export const scrape_races = async (race_codes: Array<string>) => {

  // run 4 at a time
  const tasks = _.chunk(race_codes, CONCURRENCY)

  for (let i = 0; i < tasks.length; i++) {

    try {

      const current_tasks = tasks[i]
        .map(async x => await scrape_race(x))

      await Promise.all(current_tasks)

    } catch (err) {
      log(err)
    }

  }

}

/**
 * Scrapes all races and saves the results
 */
export const scrape_all_races = async () => {
  log('start process of all races')

  const {
    races_remaining: race_codes,
    counted_unique
  } = await get_remaining_races()

  log(`${counted_unique.length} races already processed. ${races_remaining.length} races remaining`)

  await scrape_races(race_codes)

  log('finished processing of all races')
}

export const get_remaining_races = async (): Array<string> => {

  const race_codes = await get_all_race_codes()

  // races that are already scraped should be skipped
  const files = fs.readdirSync('./output')
    .map(x => x.split('_')[0])

  // there should be two files per race
  // filter out those that have two files
  const counted = files.filter(x => {
    const count = files
      .filter(y => y === x)
      .length
    return count >= 2
  })

  // remove duplicates, these are the 
  // races that have previously been processed
  const counted_unique = _.uniq(counted)

  // only scrape those races that arent processed
  const races_remaining = race_codes
    .filter(x => !counted_unique.includes(x))

  return {
    races_remaining,
    counted_unique
  }
}



const get_race_name = (race_url: string) =>{

  //  delete search query from string
  let url = race_url.substring(0,race_url.lastIndexOf('search')-1);
 

  url = url.substring(url.lastIndexOf('/')+1,url.length);
  
  return url;
}