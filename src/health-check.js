import fetch from "node-fetch";

const AbortController = globalThis.AbortController || await import('abort-controller')

export default async function healthCheck(callback) {
    const exit = ({healthy = true} = {}) => {
        return healthy
            ? process.exit(0)
            : process.exit(1);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
        controller.abort();
    }, 60000);

    const configurationObject = {
        signal: controller.signal,
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            content: "<!DOCTYPE html><html lang=\"en\"><head> <meta charset=\"utf-8\"> <title>White</title> <style type=\"text/css\"> @page{size: A4 portrait;}</style></head><body><section> <article>This is an A4 document.</article></section></body></html>",
            configuration: {},
        }),
    };

    const handleSuccessfulConnection = (healthcheck) => {
        return () => {
            healthcheck({healthy: true})
        }
    }

    const handleUnsuccessfulConnection = (healthcheck) => {
        return () => {
            healthcheck({healthy: false})
        }
    }

    const check = () => {
        return Promise.all([
            fetch('http://127.0.0.1:' + process.env.LISTEN_PORT + '/pdf', configurationObject)
                .then(res => res.json())
                .then(json => console.log(json))
                .then(handleSuccessfulConnection(exit))
                .catch(handleUnsuccessfulConnection(exit))
                .then(callback)
                .finally(() => clearTimeout(timeout))
        ])
    }

    return await check()
}
