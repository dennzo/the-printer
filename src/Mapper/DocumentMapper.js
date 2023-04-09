/**
 * @typedef {Object} DocumentData
 * @property {string}   title
 * @property {string}   head
 * @property {string}   body
´ */

/**
 * @param {DocumentData}   data The body object.
 * @returns {string} HTML string to render.
 */
export default function DocumentMapper(data) {
    return `
        <!doctype html>
        <html>
        <head>
            <title>${data.title ?? 'pdf result'}</title>
            ${data.head}
        </head>
        <body>
            ${data.body}
        </body>
        </html>
        `.trim()
}
