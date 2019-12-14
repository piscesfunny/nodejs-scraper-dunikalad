const request = require('request-promise');
const cheerio = require('cheerio')
const moment = require('moment');

const listingUrl = 'https://www.teagasc.ie/about/opportunities/current-vacancies'

const getListings = async (address, searchTerm) => {
  const { body: html } = await request({
    resolveWithFullResponse: true,
    uri: listingUrl,
  });
  const $ = cheerio.load(html)
  $('article.content-primary p').addClass('job-details')

  const urlElements = $('article.content-primary p.job-details')

  let listings = []
  let i
  let length = urlElements.length
  for (i=0; i<length; i++) {
    if (i < 2) continue
    const urlA = $(urlElements[i]).find('a')
    if (urlA) {
      const url = $(urlA).attr('href')
      listings.push({
        'url': url,
        company: 'Teagasc',
      });
    }
  }
  return listings
};

const scrapePage = ({url, $, ...existingData}) => {
  const title = $('center h3.job-title').text().trim()
  const addressElement = $('center table tbody tr').first()
  const formattedAddress = addressElement.text().trim()

  const salaryInfoText = addressElement.next().text().trim()
  let tempList = salaryInfoText.split('Scale of')
  let listLength = tempList.length - 1
  const salaryString = tempList[listLength].trim()

  const closeAtElement = $('center table tbody tr').last().children()
  let closesAt = ''
  closeAtElement.map((key, item) => {
    tempList = $(item).text().trim().split(': ')
    if (key == 0) closesAt += tempList[tempList.length - 1].trim() + ' '
    else closesAt += tempList[tempList.length - 1].trim()
  })

  closesAt = moment(closesAt, 'YYYY-MM-DDTHH:mm')
  closesAt = moment(closesAt).format('YYYY-MM-DDTHH:mm');

  let description = $('div.job-preview').html().trim()

  const data = {
    url,
    title,
    formattedAddress,
    salaryString,
    closesAt,
    description,
    ...existingData
  };
  return data;
};


module.exports = {
  scrapePage,
  getListings,
  listingUrl,
};
