/**
 * @param message       The message.
 * @param object        An optional object for context.
 */
export default function LogHelper(message, object = undefined) {
    if (
        (typeof process.env.NPM_CONFIG_LOGLEVEL === 'string' || myVar instanceof String)
        && process.env.NPM_CONFIG_LOGLEVEL.toLowerCase() === 'verbose'
    ) {
        if (undefined === object) {
            console.log(message);
            return;
        }

        console.log(message, object);
    }
}
