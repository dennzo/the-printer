# Puppeteer Print Service (PDF)

This service utilizes Puppeteer to create PDFs or Screenshots. Latter not implemented yet.
But since puppeteer uses chromium under the hood, the newest features are always available.

For example check the `.http` files.

## Usage / Installation

You have to make sure to provide the `chrome.json` when starting the container in another context.
The seccomp cannot be added during builds, only later, since this is a security option for the container.
Please refer the following statement to the docker-compose file where it is used.

The file chrome.json is **NOT** within the container, it has to be placed outside on the host machine (so the path if
from host machine).    
Mostly when placed in the same directory as the `docker-compose.yml` then just use `./chrome.json`

```yaml
# docker-compose.yml
version: '3.8'

services:
  the-printer:
    image: <REGISTRY_PATH>
    restart: unless-stopped
    environment:
      - "LISTEN_PORT=3000"
      - "NPM_CONFIG_LOGLEVEL=verbose"
      - "REQUEST_BODY_LIMIT=50mb"
    ports:
      - "127.0.0.1:3000:3000"
#    volumes: # only for local development!
#      - ./src/server.js:/home/node/app/server.js
#      - ./src:/home/node/app/src
    security_opt:
      - seccomp=/path/on/host/system/to/chrome.json
```

Or if using `docker run` then just add the following CLI option.

```bash
# docker run cli command
docker run --rm -it -p "3000:3000" --security-opt seccomp=/path/on/host/to/chrome.json <REGISTRY_PATH>
```

## Configuration

### Log Level

You can change the log level.
To enable verbose logging, just add the following environment variable.
The default log level is suited for production and will only display errors.

```yaml
# docker-compose.yaml
environment:
  - "NPM_CONFIG_LOGLEVEL=verbose"
```

The health check also logs regularly, so just ignore these.

### Request Body Limit (in case of 413 Payload to large)

When sending large requests you are likely to encounter a HTTP 413 Payload to large error.    
This can be configured direcly by passing the following environment variable.
Default is 2mb.

```yaml
# docker-compose.yaml
environment:
  - "REQUEST_BODY_LIMIT=15mb"
```

## Monitoring and Restarts

We are using `restart: unless-stopped` to ensure the container restarts if it fails.

### Health Check

There is also an implementation in which the docker container is able to heal itself when if fails.    
It uses the internal `_health` script to determine whether the container is healthy and outputs it.    
Please refer to the `HEALTHCHECK` directive within the Dockerfile.

This can be deactivated by


```yaml
# docker-compose.yaml
    healthcheck:
      test: [ "CMD", "none" ]
```

```shell
# docker run
 docker run --no-healthcheck
```

### Self Healing
The container does not automatically restart itself in case it is unhealthy,
this must be supported and configured via the orchestration system.    
For example in Kubernetes unhealthy containers can automatically be restarted.

### Restart manually
If you want to restart the node process without restarting the container, just call the route `_restart`.    
This can be useful for example while developing to reload the JavaScript changes.    
It will only work, if the `restart: unless-stopped` or `restart: always` is set.

---

## Request and its Configuration Options

You can pass any options from PDFOptions interface. 
You can find these here: https://pptr.dev/api/puppeteer.pdfoptions

```json
{
  "title": "Test PDF Title",
  "body": "<div>Content of the page</div>",
  "head": "<style></style>",
  "configuration": {
    "headerTemplate": "<div style=\"text-align: right;width: 297mm;font-size: 16px;\">SUP!</div>",
    "footerTemplate": "<div style=\"text-align: right;width: 297mm;font-size: 16px;\"><span style=\"margin-right: 1cm\"><span class=\"pageNumber\"></span> of <span class=\"totalPages\"></span></span></div>",
    "displayHeaderFooter": true,
    "printBackground": true,
    "landscape": false,
    "format": "A4",
    "width": "",
    "height": "",
    "pageRanges": "",
    "preferCSSPageSize": false
  }
}

```
### Title
Title of the PDF File. This is **NOT** the filename.

### Body
Well, this is the content, which is placed directly into `<body>*</body>` tag.

### Head
This is placed directly into the `<head>*</head>` tag. So you can also include fonts, external stylesheets and so on.
Beware, the styles for header and footer cannot be passed here, only for the body.

### Header and footer
To actually display these the option `display_header_footer` must be set to true.     
Also the margins have to be set, since they are 0 by default.    
This can be by adding the margins in the @page css. If this is not working, make sure prefer_css_page_size is set to true (which is the default).    
You can specify HTML code within the configuration object in `headerTemplate` and `footerTemplate`. 
CSS Code must be inline, this cannot be passed via head, also external stylesheets do **NOT** work.

```css
@page {
  margin: 0;
}
```

#### Page Numbering

For page numbering use the respective classes. The the current page number add `pageNumber` and `totalPages` for the
total. Here is a working example:

```html
<div style="text-align: right;width: 297mm;font-size: 16px;">
    <span style="margin-right: 1cm">
        <span class="pageNumber"></span> of <span class="totalPages"></span>
    </span>
</div>
```

### Background Colors or Images
This is deactivated by default, to enable just set `display_content_background` to true.

### Page Orientation, format and size
The option `page_orientation` allows either `landscape` or `portrait`.    
The option `page_size` allows any  [standardized size of this list](https://pptr.dev/api/puppeteer.paperformat).
You can also specify the `page_height` and `page_width` for the page, but then `page_size` must be empty.

### Page Range
The same option, which you know from your printer dialog.    
For example pass `1-3` to only print the first three pages or `3` to only print the third page.

### Page Override (prefer css page size)
Whether to prefer the configuration options or css options `@page`.
https://pptr.dev/api/puppeteer.pdfoptions.prefercsspagesize

---

## Information regarding Chromium

### Configure the chromium browser
https://chromeenterprise.google/policies/

- JavaScript is Disabled by default!
- Browser runs in headless mode

## Debugging

https://developer.chrome.com/blog/headless-chrome/#debugging-chrome-without-a-browser-ui

## Solutions to general problems
- https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-on-alpine
- https://www.xspdf.com/resolution/53997175.html
- https://github.com/puppeteer/puppeteer/issues/6560

## Kernel Security (ex. seccomp, unprivileged_userns_clone)
https://security.stackexchange.com/a/209533    
Also the solution to the PID namespace problem.
Like this chrome runs in a sandbox mode, which cannot load any malware, because it
is completely isolated from the host system and has no permissions for it.
https://ndportmann.com/chrome-in-docker/

## Illustration to Chrome Sandboxing
https://www.google.com/googlebooks/chrome/med_26.html

## Sources / References
Got some inspiration from https://github.com/Zenika/alpine-chrome

## Supporting chinese alphabet
You have to additionally install `wqy-zenhei`.
