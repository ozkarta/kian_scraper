#! /usr/bin/env node

/**
 * run-race-results-scraper script
 */

import {
    scrape_race,
    scrape_races,
    scrape_all_races,
    get_remaining_races
} from './logic'

main()

/**
 * Run the application
 * Usage:
 * 0 parameters  => Scrapes all pages
 * 1 parameter   => Scrapes single race with first parameter as race_id
 * 2+ parameters => Scrapes all specified race ids
 */
async function main() {

    console.log('hey there , It is ozzy' );

    console.dir(process.argv);

    //return;

    if (process.argv.length <= 2) {
        
        // scrape everything
        console.log('scraping all pages...')
        await scrape_all_races()

    } else if (process.argv.length > 3) {
        // scrape multiple races
        const args = process.argv.slice(2)
        await scrape_races(args)

    } else {

        const arg = process.argv[2]

        if (arg === 'test') {
            // only show which races aren't scraped yet
            const remaining_races = await get_remaining_races()
            console.log(`Remaining race: ${remaining_races.join(',')}`)
        } else {
            // scrape race
            console.log(`scraping race ${arg}`)
            await scrape_race(arg)
        }

    }
}
