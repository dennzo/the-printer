'use strict';

import puppeteer from 'puppeteer-core';
import express from 'express';
import PdfAction from "./Action/PdfAction.js";
import HealthCheckAction from "./Action/HealthCheckAction.js";
import RestartAction from "./Action/RestartAction.js";
import bodyParser from "body-parser";

(async () => {
    let app_port = process.env.LISTEN_PORT ?? 3000;

    // Setting up express
    const app = express();
    app.use(bodyParser.json({limit: process.env.REQUEST_BODY_LIMIT ?? '2mb'}));

    const browser = await puppeteer.launch({
        // Launch options if necessary.
        // https://github.com/puppeteer/puppeteer/blob/v5.3.0/docs/api.md#puppeteerlaunchoptions
        headless: "new",
        executablePath: "/usr/bin/chromium-browser",
        skipDownload: true,
        args: [
            '--font-render-hinting=none',
            '--force-color-profile=srgb',
            '--disable-sync',
            '--ignore-certificate-errors',
            '--disable-gpu',
            '--no-sandbox',
            '--disable-speech-api',
        ],
    });

    process.on('exit', async (code) => {
        console.log(`Exit code: ${code}.`);

        // always make sure to close the chromium browser.
        await browser.close();
    });


    app.get('/_restart', RestartAction)

    app.get('/_health', HealthCheckAction)

    app.post('/pdf', (request, response) => {
        PdfAction(request, response, browser)
    });

    app.listen(app_port, function () {
        console.log(`App at 'http://127.0.0.1:${app_port}'.`);
    });
})();
