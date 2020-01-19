const { initPuppeteer } = require('../puppeteer');
const moment = require('moment');

let listingUrl = 'https://www.amazon.jobs/en/locations/ireland?offset=0&result_limit=10&sort=recent&distanceType=Mi&radius=24km&latitude=&longitude=&loc_group_id=&loc_query=&base_query=&city=&country=&region=&county=&query_options=&';

const getListings = async (address, searchTerm, pageUrl=listingUrl) => {
    const { browser, page } = await initPuppeteer({
        defaultViewport: null,
        // slowMo: 100
    });

    let listings = []
    try {

        await new Promise(async (resolve, reject) => {
            try {

                await page.goto(listingUrl);
                await page.waitForSelector('.job-tile');

                let pageNumber;

                while (true) {
                    const dataPerPage = await page.evaluate(() => {
                        const urlElements = document.querySelectorAll('.job-tile');
                        const result = []
                        let urlPortion, url
                        let tempText, tempList, postingDate;
                        urlElements.forEach((item) => {
                            urlPortion = item.querySelector('a').getAttribute('href').trim();
                            url = 'https://www.amazon.jobs' + urlPortion;

                            tempText = item.querySelector('h2.posting-date').innerText.trim();
                            tempList = tempText.split('Posted ');
                            postingDate = tempList[tempList.length - 1]

                            result.push({ url, postingDate })
                        });
                        return result
                    });

                    let tempDate, tempDateMoment, nowMoment, difference
                    const filteredDataPerPage = dataPerPage.filter((obj) => {
                        tempDate = obj.postingDate
                        tempDateMoment = moment(tempDate, 'LL')
                        nowMoment = moment();
                        difference = nowMoment.diff(tempDateMoment, 'days');
                        if (difference < 31) return obj.url
                    })

                    const urlsPerPage = []
                    filteredDataPerPage.map((item) => {
                        urlsPerPage.push({url: item.url})
                    })

                    listings = listings.concat(urlsPerPage);

                    if (filteredDataPerPage.length < 10)
                        break;

                    pageNumber = await page.evaluate(() => {
                        const result = document.querySelector('.pagination-control .current-page').innerText.trim();
                        return result;
                    })

                    await Promise.all([
                        await page.goto(`https://www.amazon.jobs/en/locations/ireland?offset=${pageNumber*10}&result_limit=10&sort=recent&distanceType=Mi&radius=24km&latitude=&longitude=&loc_group_id=&loc_query=&base_query=&city=&country=&region=&county=&query_options=&`),
                        await page.waitForSelector('div.job-tile')
                    ])
                }

                resolve();
            } catch (error) {
                reject(error);
            }
        })

        await browser.close();
        debugger

        return listings
    }
    catch(error) {
        console.log(error)
        return listings
    }
};

const scrapePage = async ({ url, $, existingData }) => {
    const { browser, page } = await initPuppeteer({
        defaultViewport: null,
        // slowMo: 100
    });
    const company = 'Amazon';

    await page.goto(url)
    await page.waitForSelector('.info-wrapper');

    const result = await page.evaluate(() => {
        const title = document.querySelector('.info-wrapper .info .title').innerText.trim();
        const formattedAddress = document.querySelector('.location-icon .association-content a').innerText.trim();
        let description = document.querySelector('#job-detail-body .row div div.content').innerHTML.trim();

        return { title, formattedAddress, description }
    });

    const { title, formattedAddress, description} = result

    const data = {
        url,
        title,
        description,
        formattedAddress,
        company,
        ...existingData
    };

    await browser.close();
    debugger

    return data;
};


module.exports = {
    scrapePage,
    getListings,
    listingUrl,
};
