/**
 * @param request       The request object.
 * @param response      The response object.
 * @returns {boolean}   Returns true if validation passed, false if not.
 */
import LogHelper from "../Helper/LogHelper.js";

export default function RequestValidationHandler(request, response) {

    if (
        request.body
        && request.body.body
        && request.body.head
        && request.body.configuration
        && request.body.configuration instanceof Object
    ) {
        return true
    }

    LogHelper('Request body', request.body);
    response.status(400);
    response.json({
        message: 'Invalid request body. Please provide a valid JSON array containing "body" (html), "head" (html) and "configuration" (object).',
    });


    return false
}
