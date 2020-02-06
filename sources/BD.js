const request = require('request-promise');
const cheerio = require('cheerio');
const { initPuppeteer } = require('../puppeteer');

let listingUrl = 'https://www.bdcareers.ie/jobs';
let listings = [];

const getListings = async (address, searchTerm, pageUrl=listingUrl) => {
    const response = await request({
        resolveWithFullResponse: true,
        uri: pageUrl,
    });
    const $ = cheerio.load(response.body);

    let urlElements = $('h2.entry-title.fusion-post-title');

    let url, title, location, tempList, formattedAddress;

    urlElements.map((key, item) => {
        url = $(item).find('a').attr('href');
        title = $(item).find('a').text().trim();
        location = $(item).next().next().text().trim();
        tempList = location.split(' ');
        formattedAddress = tempList[tempList.length-1].trim();

        listings.push({
            url,
            title,
            formattedAddress
        })
    });

    return listings;
};

const scrapePage = async ({ url, existingData }) => {
    const { browser, page } = await initPuppeteer({
        defaultViewport: null,
        slowMo: 100
    });

    await page.goto(url);
    await page.waitForSelector('#wd-PageContent-vbox');
    const description = await page.$eval('#wd-PageContent-vbox > div > ul:nth-child(3)', el=>el.outerHTML);

    const company = 'BD';

    const data = {
        url,
        ...existingData,
        description,
        company
    };

    browser.close();

    return data;
};

// getListings()
// scrapePage({url: 'https://bdx.wd1.myworkdayjobs.com/EXTERNAL_CAREER_SITE_IRELAND/job/IRL-Limerick---Castletroy/Product-Specialist---Infusion-Systems_R-351431-7'})

module.exports = {
    scrapePage,
    getListings,
    listingUrl,
};
