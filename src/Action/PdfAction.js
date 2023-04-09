import RequestErrorHandler from "../Handler/RequestErrorHandler.js";
import RequestValidationHandler from "../Handler/RequestValidationHandler.js";
import DocumentMapper from "../Mapper/DocumentMapper.js";
import ConfigurationMapper from "../Mapper/ConfigurationMapper.js";
import LogDebugHelper from "../Helper/LogHelper.js";


/**
 * @param {import('express').Request}   request     The request object.
 * @param {import('express').Response}  response    The response object.
 * @param {import('puppeteer').Browser} browser     The browser object.
 * @return {void}
 */
export default async function PdfAction(request, response, browser) {

    if (RequestErrorHandler(request, response) || !RequestValidationHandler(request, response)) {
        LogDebugHelper('Request validation has failed.', request)
        return;
    }

    LogDebugHelper('Incoming request body', request.body);

    // setting the content-type
    response.type('application/pdf');

    // opening a new page and rendering it as pdf.
    const page = await browser.newPage()
    await page.setContent(DocumentMapper(request.body))
    const buffer = await page.pdf(ConfigurationMapper(request.body.configuration))

    // closing the browser and returning the pdf
    await page.close();
    response.end(buffer)
}
