import fetch from 'node-fetch'

export default function HealthCheckAction(request, response) {
    response.type('application/json')

    let status = true;
    let errorMessage = null;

    fetch('http://localhost:' + process.env.LISTEN_PORT + '/pdf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: 'Health Check Test',
            body: '<p>This is the content of the health check test.</p>',
            head: '<style></style>',
            configuration: {},
        })
    })
        .then((response) => {
            status = true
            if (200 !== response.status) {
                status = false
                errorMessage = response.status + ': ' + response.statusText
                response.statusCode = response.status
            }
        })
        .catch((error) => {
            status = false
            errorMessage = error
            response.statusCode = 500
        })
        .then(() => {
            response.end(JSON.stringify({
                status: status,
                error: errorMessage,
            }))
        })

}
