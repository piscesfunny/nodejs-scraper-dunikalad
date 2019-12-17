let request = require('request-promise');
const cheerio = require('cheerio')
const moment = require('moment');


const listingUrl = 'https://ldn.tbe.taleo.net/ldn02/ats/careers/v2/searchResults?org=ARNOTTS&cws=48'

const getListings = async (address, searchTerm) => {
  request = request.defaults({
    jar: true,                 // save cookies to jar
    followAllRedirects: true   // allow redirections
  });

  const response = await request({
    resolveWithFullResponse: true,
    uri: listingUrl,
  });

  const cookie = response.headers['set-cookie'][0]
  const $ = cheerio.load(response.body)
  const matchedPositions = parseInt($('span.oracletaleocwsv2-panel-number').text())

  let listings = []
  $('div.oracletaleocwsv2-accordion-expandable').map((key, item) => {
    const urlA = $(item).find('div.oracletaleocwsv2-accordion-head-info h4.oracletaleocwsv2-head-title a')
    if (urlA) {
      const url = $(urlA).attr('href')
      listings.push({
        'url': url,
        company: 'BrownThomas',
      });
    }
  })

  const requestCount = Math.ceil(matchedPositions/10) - 1
  let requestUrl = '', pageStart = 0
  for (let i=0; i<requestCount; i++) {
    pageStart = (i+1)*10
    requestUrl = 'https://ldn.tbe.taleo.net/ldn02/ats/careers/v2/searchResults?next&'
    requestUrl += 'rowFrom=' + pageStart.toString() + '&act=null&sortColumn=null&sortOrder=null&'
    requestUrl += 'currentTime=' + Date.now()

    const response = await request({
      resolveWithFullResponse: true,
      uri: requestUrl,
      header: {
        'Cookie': cookie
      }
    })

    const $ = cheerio.load(response.body)
    $('div.oracletaleocwsv2-accordion-expandable').map((key, item) => {
      const urlA = $(item).find('div.oracletaleocwsv2-accordion-head-info h4.oracletaleocwsv2-head-title a')
      if (urlA) {
        const url = $(urlA).attr('href')
        listings.push({
          'url': url,
        });
      }
    })
  }

  return listings
}

const processTitle = (title) => {
  title = title.replace(/Brown Thomas|Arnotts/gi, '')
  if (title.includes(',')) {
    return title
    .split(',')
    .map(word => word.trim())
    .filter(Boolean)
    .slice(1)
    .join(',')
  }
  return title.replace(/\s\s/g, ' ');
}

const scrapePage = ({url, $, existingData }) => {
  const wrapperElement = $('div.col-md-4 div.oracletaleocwsv2-job-description')
  const title = $('div.col-md-4 div.oracletaleocwsv2-job-description > strong').text().trim()

  const formattedAddress = wrapperElement.find('div.row div.col-md-12').last().find('strong').text().trim()

  const company = /Arnotts/ig.test(title) ?  'Arnotts': 'Brown Thomas';
  
  const description = $('div.col-md-8').html().trim()

  const data = {
    url,
    title: processTitle(title),
    formattedAddress,
    description,
    company,
    ...existingData
  };
  return data;
};

module.exports = {
  scrapePage,
  getListings,
  listingUrl,
};
