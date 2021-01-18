(async function () {
    console.log('Copyright (c) 2020-2021 Marcel, github@gameplayjdk.de');

    // Set up 'puppeteer'...

    const puppeteer = require('puppeteer');

    const browser = await puppeteer.launch({
        // https://github.com/puppeteer/puppeteer/blob/v5.3.0/docs/api.md#puppeteerlaunchoptions
    });

    process.on('exit',
         /**
         * @param {number}      code    The exit code.
         */
        async function (code) {
            console.log(`App exit code '${code}'.`);

            await browser.close();
        }
    );

    // Set up 'express'...

    const express = require('express');

    const app = express();
    const app_port = 3000;

    const app_body_json = require('body/json');

    // Set up 'file-url'...

    const app_file_url = require('file-url');

    // Set up type definition...

    /**
     * @typedef {Object} Configuration
     * @property {boolean}  displayContentOnly
     * @property {boolean}  displayContentBackground
     * @property {string}   templateHeader
     * @property {string}   templateFooter
     * @property {string}   pageOrientation
     * @property {string}   pageFormat
     * @property {string}   pageWidth
     * @property {string}   pageHeight
     * @property {string}   pageRange
     * @property {boolean}  pageOverride
     * @property {Object}   margin
     * @property {string}   margin.top
     * @property {string}   margin.right
     * @property {string}   margin.bottom
     * @property {string}   margin.left
     */

    // Set up function...

    /**
     * Map the configuration object to the page.pdf() option object.
     *
     * There is a conflict between pageOrientation and pageWidth/pageHeight, while pageFormat works normally! Read more
     * about the issue {@link https://github.com/puppeteer/puppeteer/issues/3834#issuecomment-662395671 here}.
     *
     * @param {Configuration}   configuration The configuration object.
     * @return {import('puppeteer').PDFOptions}
     */
    function mapConfiguration(configuration) {
        /**
         * @type {import('puppeteer').PDFOptions}
         */
        const optionObject = {
            // https://github.com/puppeteer/puppeteer/blob/v5.3.0/docs/api.md#pagepdfoptions
        };

        optionObject.path = null;
        optionObject.scale = 1;
        optionObject.displayHeaderFooter = !configuration.displayContentOnly;
        optionObject.headerTemplate = configuration.templateHeader;
        optionObject.footerTemplate = configuration.templateFooter;
        optionObject.printBackground = configuration.displayContentBackground;
        optionObject.landscape = ('landscape' === configuration.pageOrientation);
        optionObject.pageRanges = configuration.pageRange;
        optionObject.format = configuration.pageFormat;
        optionObject.width = configuration.pageWidth;
        optionObject.height = configuration.pageHeight;
        optionObject.margin = configuration.margin;
        optionObject.preferCSSPageSize = configuration.pageOverride;

        console.log(optionObject);

        return optionObject;
    }

    /**
     * Get a pdf file as stream from an url string and a configuration object.
     *
     * @param {string}          content                 The target url string.
     * @param {Configuration}   configuration           The configuration object.
     * @return {Promise<Buffer>}
     */
    async function getStream(content, configuration) {
        const page = await browser.newPage();
        // Disable JS.
        await page.setJavaScriptEnabled(false);
        await page.goto(content, {
            // https://github.com/puppeteer/puppeteer/blob/v5.3.0/docs/api.md#pagegotourl-options
        });

        // Note: When some resource is not present in the pdf output, make sure it is available upon generation. The
        //  network can cause a delay with no adherence to the wait-until option!

        const optionObject = mapConfiguration(configuration);

        const stream = await page.pdf(optionObject);

        await page.close();

        return stream;
    }

    /**
     * Validate the body object.
     *
     * @param {Object} body The body object.
     * @return {boolean}
     */
    function validateBody(body) {
        return (body !== null) && body.content && body.configuration;
    }

    // Set up app...

    app.get('/pdf',
        /**
         * @param {import('express').Request}   request     The request object.
         * @param {import('express').Response}  response    The response object.
         * @return {void}
         */
        function (request, response) {
            app_body_json(request, response, {
                // https://www.npmjs.com/package/body#jsonbodyreq-res-opts-cberror-any
            },
                /**
                 * @param {Error}   error       An error.
                 * @param {Object}  body        The body object.
                 * @return {void}
                 */
                async function (error, body) {
                    // TODO: Log.

                    if (error) {
                        response.status(500);
                        response.json({
                            message: error.message,
                        });
                        return;
                    }

                    if (!validateBody(body)) {
                        response.status(400);
                        response.json({
                            message: 'invalid request body',
                        });
                        return;
                    }

                    const content = body.content;
                    const configuration = body.configuration;

                    response.type('application/pdf');

                    const content_url = app_file_url(content, {
                        // https://www.npmjs.com/package/file-url#fileurlfilepath-options
                        resolve: true,
                    });

                    const stream = await getStream(content_url, configuration);

                    response.end(stream, 'binary');
                }
            );
        }
    );

    // Start app...

    app.listen(app_port, function () {
        console.log(`App at 'http://127.0.0.1:${app_port}'.`);
    });
})();
