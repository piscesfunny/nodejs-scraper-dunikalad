## Install 

`npm install`

## Task
I need you to define two functions for me that I can use to scape websites.

These functions are `getListings` and `scrapePage`. 

`getListings` is used to scrape a list of results on a given website.

`scrapePage` is then used to scape the individual pages returned from `getListings`

These functions should be exported from the same file as well as the `listingUrl` used by `getListings` as the `scrapePageRequestOptions` if they are needed by the `scrapePage` function. (see test.js for implementation details)

I don't care how you get the data as long as the final result from `scrapePage` passes the `isValidItem` test function (see utils.js for implementation details).

## Work Flow
User `template.js` as a starting point

I will give you a website to scrape. For example `https://www.dpdhl.jobs/search-jobs/Ireland/1886/2/2963597/53/-8/50/2`

Create a new file from the template file in the same directory as the template file and name it after the website in pascal case. Using the example above, we would name it `Dpdhl.js` inside the `sources` folder.


## Define the `getListings` function

You can test it by running `npm run test-listing`. To see how this is used see `package.json > scripts` and `test.js`. You need to set the `source` env variable which will tell it which source to test. Using the example above it would be `source=Dpdhl npm test-listing`.

You can check the results in the `results` folder.

The `getListings` function accepts an address and a search term argument. These are used in special cased where you need to make a search based on a location or search term. These values can be set from the environment variables (see test.js for implementation details).

## Define the `scrapePage` function

You can test it by running `npm run test-page`. To see how this is used see `package.json > scripts` and `test.js`. You need to set the `source` env variable which will tell it which source to test. You also need to set the `url` environment variable to tell it which page to scrape.

Using the example above the command would be `url='https://www.dpdhl.jobs/job/dublin/general-operative/1886/12541176' source=Dpdhl npm test-page`.

You can check the results in the `results` folder.

## Final test 

To test that both the `getListings` and `scrapePage` work as expected you need to run `npm test-all`. This will scrape the listings and use the first result to use for the `scrapePage`