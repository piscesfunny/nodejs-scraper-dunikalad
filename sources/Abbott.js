const { initPuppeteer } = require('../puppeteer');

let listingUrl = 'https://www.jobs.abbott/us/en/search-results?qcountry=Ireland';

const getListings = async (address, searchTerm, pageUrl=listingUrl) => {
    const { browser, page } = await initPuppeteer({
        defaultViewport: null,
        slowMo: 100
    });

    let data = [];

    try {
        await new Promise(async (resolve, reject) => {
            try {
                // setTimeout(() => {
                //     console.log('Timeout exceeded');
                //     resolve();
                // }, 270000);

                await page.goto(pageUrl, {
                    timeout: 0,
                    waitUntil: "networkidle0"
                });

                await page.waitForSelector('div.phs-jobs-block.au-target > ul > li');

                const urlElements = await page.$$('div.phs-jobs-block.au-target > ul > li > div.information > a');

                const company = 'Abbott';
                let url, title, description, formattedAddress;
                for (let x=0; x<urlElements.length; x++) {
                    const elements = await page.$$('div.phs-jobs-block.au-target > ul > li > div.information > a');
                    await elements[x].click();
                    await page.waitForSelector('section.job-description');
                    url = page.url();
                    title = await page.$eval('div.job-info.au-target > h1', el => el.innerText);
                    formattedAddress = await page.$eval('div.col-md-3.col-sm-6.col-xs-12.fieldsBlockTwo > ul > li:nth-child(1) > p', el => el.innerText);
                    description = await page.$eval('section.job-description', el => el.outerHTML);

                    console.log(`URL: ${url}, Title: ${title}`);

                    data.push({
                        url,
                        title,
                        description,
                        formattedAddress,
                        company
                    });

                    await page.goto(pageUrl, {
                        timeout: 0,
                        waitUntil: "networkidle0"
                    });
                }

                resolve();
            } catch (error) {
                reject(error);
            }
        });

        browser.close();

        return data

    } catch(error) {
        console.log(error);
        return data
    }
};

// getListings()

module.exports = {
    getListings,
    listingUrl,
};
