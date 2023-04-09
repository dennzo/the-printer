/**
 * @param request       The request object.
 * @param response      The response object.
 * @returns {boolean}   Returns true if an error occurred, false if not.
 */
export default function RequestErrorHandler(request, response) {
    if (request.error) {
        response.status(500);
        response.json({
            message: request.error.message,
        });

        return true
    }

    return false
}
