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
 * @property {boolean}  page_override
 * @property {Object}   margin
 * @property {string}   margin.top
 * @property {string}   margin.right
 * @property {string}   margin.bottom
 * @property {string}   margin.left
 */

/**
 * Map the configuration object to the page.pdf() option object.
 *
 * There is a conflict between pageOrientation and pageWidth/pageHeight, while pageFormat works normally! Read more
 * about the issue {@link https://github.com/puppeteer/puppeteer/issues/3834#issuecomment-662395671 here}.
 *
 * @param {Configuration}   inputConfiguration The configuration object.
 * @return {import('puppeteer').PDFOptions}
 */
export default function ConfigurationMapper(inputConfiguration) {
    // https://github.com/puppeteer/puppeteer/blob/v5.3.0/docs/api.md#pagepdfoptions

    /**
     * @type {import('puppeteer').PDFOptions}
     */
    return {
        path: null,
        scale: inputConfiguration.scale ?? 1,
        displayHeaderFooter: inputConfiguration.display_header_footer ?? false,
        headerTemplate: inputConfiguration.header ?? '',
        footerTemplate: inputConfiguration.footer ?? '',
        printBackground: inputConfiguration.display_content_background ?? false,
        landscape: ('landscape' === inputConfiguration.page_orientation ?? 'landscape'),
        pageRanges: inputConfiguration.page_range ?? '',
        format: inputConfiguration.page_format ?? undefined,
        width: inputConfiguration.page_width ?? '',
        height: inputConfiguration.page_height ?? '',
        margin: inputConfiguration.margin ?? '0',
        preferCSSPageSize: inputConfiguration.page_override ?? false,
    };
}
