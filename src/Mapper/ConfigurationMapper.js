/**
 * @typedef {Object} Configuration
 * @property {integer}  scale
 * @property {boolean}  display_header_footer
 * @property {boolean}  display_content_background
 * @property {Object}   header
 * @property {string}   header.pages_all
 * @property {string}   header.pages_first
 * @property {Object}   footer
 * @property {string}   footer.pages_all
 * @property {string}   footer.pages_first
 * @property {string}   page_orientation
 * @property {string}   page_format
 * @property {string}   page_width
 * @property {string}   page_height
 * @property {string}   page_range
 * @property {boolean}  prefer_css_page_size
 */

/**
 * Map the configuration object to the page.pdf() option object.
 *
 * There is a conflict between pageOrientation and pageWidth/pageHeight, while pageFormat works normally! Read more
 * about the issue {@link https://github.com/puppeteer/puppeteer/issues/3834#issuecomment-662395671 here}.
 *
 * @param {Configuration}   inputConfiguration The configuration object.
 * @return {import('puppeteer-core').PDFOptions}
 */
export default function ConfigurationMapper(inputConfiguration) {
    // https://github.com/puppeteer/puppeteer/blob/v5.3.0/docs/api.md#pagepdfoptions

    /**
     * @type {import('puppeteer-core').PDFOptions}
     */
    return {
        path: null,
        scale: 1,
        displayHeaderFooter: false,
        headerTemplate: '',
        footerTemplate: '',
        printBackground: false,
        landscape: false,
        pageRanges: '',
        format: 'A4',
        width: '',
        height: '',
        preferCSSPageSize: true,
        ...inputConfiguration ?? {}, // override defaults from request
    };
}
