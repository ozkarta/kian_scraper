/**
 * data.js
 * Contains the scraping functions
 */

import { log } from './utils'
import cheerio from 'cheerio'
import fetch from 'node-fetch'

/**
 * Get a list of all available race codes
 * @returns {Array<string>} 
 */
export const get_all_race_codes = async (): Array<string> => {

  console.log('getting latest race ids')

  const url = 'http://runraceresults.com/'

  const response = await fetch(url)
  const contents = await response.text()

  const $ = cheerio.load(contents)

  const ids = $('td a')
    .map((i, elem) => {

      if (!elem.attribs['href']) {
        console.log('attrib_', race_id)
      }

      const href_split = elem.attribs['href'].split('=')

      // skip races that have their results saved on different websites
      if (href_split.length < 2) {
        return null
      }

      return href_split[href_split.length - 1]
    })
    .get()
    .filter(x => x !== null)

  return ids
}

/**
 * Get leaderboard url for a specific event and page
 * @param {string} race_id 
 * @param {number} first_record_id
 */
const get_race_leaderboard_url = (race_id: string, first_record_id: number) => {
  
  return `https://www.runraceresults.com/Secure/raceResultsAPI.cfm?do=race%3Aresults%3Aoneclick&EVID=${race_id}&RCID=1&SROW=${first_record_id}&TYPE=overall`

}

//  get  page  number   from URL  
const get_leaderboard_url_page_number = (race_url: string) => {

  return parseInt(race_url.substring(race_url.lastIndexOf("page"), race_url.length).replace('page=', '').replace('#', ''));

}

//  sets page=x  in the url  and returns 
const get_leaderboard_url_from_current_url = (race_url: string, page: number) => {

  return race_url.substring(0, race_url.lastIndexOf('page') + 5) + page;

}

const get_race_runner_url = (race_url: string, bib: number) => {

  let runner_url = race_url.substring(0, race_url.lastIndexOf('search'));
  runner_url = runner_url + bib + '/entrant';

  return runner_url;

}

/**
 * Get full race leaderboards for a specific race
 * @param {string} race_id 
 * @returns {Array<Ranking>} collection of runner objects
 */
export const get_race_leaderboard = async (race_url: string) => {

  // get url of the first page
  //  Example URL:
  //  http://georesults.racemine.com/corrigan-sports-enterprises/events/2017/oakland-running-festival-2017/search?SelectedDivisionName=MARATHON&page=2#

  //const url = get_race_leaderboard_url(race_id, 1)
  const url = race_url.replace('&', '\&');

  // fetch first page
  const first_page_response = await fetch(url)
  const first_page_content = await first_page_response.text()

  const $ = cheerio.load(first_page_content)

  // if (!$('#result-data tr:nth-child(2) td:nth-child(1)').html()) {
  //   console.log(`no results for ${race_id}`)
  //   return []
  // }

  if (!$('.table-responsive table tbody').html()) {
    console.log(`no results for url: ${race_id}`)
    return []
  }

  //console.dir($('.table-responsive table tbody').html());

  // find out how many pages there are
  // const PAGE_SIZE = 100
  // const paging_text_split = $('#result-data tr:nth-child(2) td:nth-child(1)').html().split(' ')
  // const number_of_records = parseInt(paging_text_split[paging_text_split.length - 1])
  // const number_of_pages = Math.ceil(number_of_records / PAGE_SIZE)

  let number_of_pages = 1;
  const PAGE_SIZE = 50;

  // find number of pages
  if ($('.page-count div').html()) {

    let number_of_pages_holder = $('.page-count div').children()[5].children[0].data;

    if (number_of_pages_holder) {
      console.dir(number_of_pages_holder.split(' '));
      number_of_pages = parseInt(number_of_pages_holder.split(' ')[1]);
    }

  } else {
    console.log('!!!could not find number of pages!!!');
  }





  //log(`start process race ${race_id}, pages ${number_of_pages}, records ${number_of_records}`)
  log(`start process from URL ${race_url}, pages ${number_of_pages}`);

  // determine headers

  // const headers = $('#result-data:nth-child(2) tr:nth-child(1) td')
  //   .map((_, elem) => elem.children[0].data)
  //   .get()



  // Generate Headers from THEAD
  const headers = $('.table-responsive table thead tr th')
    .map((_, elem) => elem.children[0].data)
    .get();

  // console.dir(headers);

  // gets current page from url
  const current_page = get_leaderboard_url_page_number(url);

  // process all pages and build result
  const result = [headers]

  // starts  from current page
  for (let i = current_page; i <= number_of_pages; i++) {

    // create new URL
    let url_to_fetch = get_leaderboard_url_from_current_url(url, i);


    // determine which page to fetch, fetch and process it

    //const record_id = (i * PAGE_SIZE) + 1
    //const current_page_response = await fetch(get_race_leaderboard_url(race_id, record_id));
    const current_page_response = await fetch(url_to_fetch);
    const current_page_content = await current_page_response.text()

    const $$ = cheerio.load(current_page_content)

    //log(`processing race ${race_id}, page: ${i + 1}/${number_of_pages}, record: ${record_id}-${record_id + 99}/${number_of_records}`)

    // will hold the rows for the current page
    const rows = []

    // get all relevant <tr>'s - these are the rows on the page
    //$$('#result-data:nth-child(2) tr')
    $$('.table-responsive table tbody tr')
      // skipping the first because those are always the headers
      // Ozzy => no need to slice, Table headers are in TBODY
        //.slice(1)
      // then extract the data from each row as an array
      .each((j, row) => {
        // select the current row
        const columns = $$(row)
          // get all child columns
          .children('td')
          // extract the data
          .map((_, row) => row.children[0].next.children[0])
          // convert to array
          .get()

        // add array to result set for current page



        //generate data from children
        let arr = columns.map((elem) => {
          return elem.data;
        });
        rows.push(arr);
      })

    // add result set from current page to complete result set
    result.push(...rows)
  }

  //log(`finish process race ${race_id} with ${number_of_pages} pages and ${result.length - 1} records`)
  
  return result
}

/**
 * Get statistics for a runner at a specific race
 * @param {string} race_id 
 * @param {number} bib 
 * @returns {object} object representing the runners details by key and avlue
 */
export const get_race_runner = async (race_id: string, bib: number) => {

  

  const url = get_race_runner_url(race_id,bib);
  console.log(url);

  const response = await fetch(url);
  const contents = await response.text();

  const $ = cheerio.load(contents)



  if (!$('.table-responsive table tbody').html()) {
    console.log('does not exist');
    return []
  }


  console.dir();

  let headers = [];
  let body = []; 
  let runner = [];
  $('.table-responsive table tbody tr')
      .each((i,tr)=>{
        
        let key = '';
        let value = '';
        tr.children.map((child)=>{
            //console.dir(child);
            
            if(child.name === 'th'){
              //headers.push(child.children[0].data);
              key = child.children[0].data;
            }
            if(child.name === 'td'){
              //body.push((child.children[0].data || child.children[0].children[0].data).replace('\r','').replace('\n',''));
              value = (child.children[0].data || child.children[0].children[0].data).replace('\r','').replace('\n','').trim();
            }

            if ( key && value ){
              // let pair = {};
              // pair[key] = value;

              // console.dir(pair);
              // runner.push(pair);
              runner.push([key,value]);

              key = '';
              value = '';
            }
            

        });


        // headers.push(tr.children('th')[0].data)
        // body.push(tr.children('td')[0].data);

      });

    // console.dir(headers);
    // console.dir(body);

    //console.dir(runner);


  //let runner = {headers,body};
  
  
  log(`processed runner for race ${race_id} with bib ${bib}`)

  return runner
}
