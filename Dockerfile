# Solutions to general problems
# @see https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-on-alpine
# @see https://www.xspdf.com/resolution/53997175.html
# @see https://github.com/puppeteer/puppeteer/issues/6560
#
# Kernel Security (ex. seccomp, unprivileged_userns_clone)
# @see https://security.stackexchange.com/a/209533
# Also the solution to the PID namespace problem.
# Like this chrome runs in a sandbox mode, which cannot load any malware, because it
# is completely isolated from the host system and has no permissions for it.
# @see https://ndportmann.com/chrome-in-docker/
#
# Illustration to Chrome Sandboxing
# @see https://www.google.com/googlebooks/chrome/med_26.html
#
# Got some inspuration from
# @see https://github.com/Zenika/alpine-chrome

FROM node:21.6-alpine3.18
#FROM node:19.6-alpine3.17

LABEL maintainer="Dennis Barlowe <d.barlowe@life-style.de>"
LABEL org.opencontainers.image.source="https://github.com/dennzo/the-printer"

ENV NODE_ENV=production \
    TZ=Europe/Berlin \
    DOCUMENT_ROOT=/home/node/app \
    NPM_CONFIG_LOGLEVEL=warn \
    PATH=/home/node/scripts:${PATH} \
    CHROME_BIN=/usr/bin/chromium-browser \
    CHROME_PATH=/usr/lib/chromium/ \
    GIT_BRANCH=main \
    LISTEN_PORT=3000 \
    REQUEST_BODY_LIMIT=2mb

USER root

# Installing all dependencies
# it may be necessary to install chromium in an officially supported version, but for now it seems to be working.
# @see https://pptr.dev/chromium-support
RUN apk update && apk add --no-cache \
    libstdc++ \
    chromium \
    harfbuzz \
    nss \
    freetype \
    ttf-freefont \
    font-noto-emoji \
    freetype-dev \
    ca-certificates \
    curl \
    && rm -rf /var/cache/apk

# If you don't chown here, in some cases the owning user is root and you won't have access to any ressources.
RUN mkdir ${DOCUMENT_ROOT} && chown -R node:node ${DOCUMENT_ROOT}

COPY --chown=node . ${DOCUMENT_ROOT}

# Switch to user node for non-root privileges
USER node


# Change the workdir to the current app directory
WORKDIR ${DOCUMENT_ROOT}

RUN npm install --omit=dev \
    && npm prune --omit=dev

# Automatically restarts docker container with the policy `restart: always|unless-stopped` if supported by orchestration
HEALTHCHECK --interval=30s --timeout=30s --start-period=10s \
    CMD curl -f http://localhost:${LISTEN_PORT}/_health || kill 1

EXPOSE ${LISTEN_PORT}

CMD [ "npm", "run", "server-start"]
