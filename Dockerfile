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

FROM ghcr.io/made/alpine-node:latest
# TODO: Yes, latest for now. We will change this as soon as everything is tested and we will start with production deployments.

LABEL org.opencontainers.image.source = "https://github.com/made/the-printer"

ENV CHROME_BIN=/usr/bin/chromium-browser \
    CHROME_PATH=/usr/lib/chromium/ \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

USER root

# Installs latest Chromium package.
# TODO: fixed version for each if we really use it this way
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" > /etc/apk/repositories \
    && echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories \
    && echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
    && echo "http://dl-cdn.alpinelinux.org/alpine/v3.12/main" >> /etc/apk/repositories \
    && apk upgrade -U -a \
    && apk add \
    libstdc++ \
    chromium \
    harfbuzz \
    nss \
    freetype \
    ttf-freefont \
    font-noto-emoji \
    wqy-zenhei \
    freetype-dev \
    ca-certificates \
    && rm -rf /var/cache/* \
    && mkdir /var/cache/apk

USER node

# Copy project files into the image and make sure it is user node.
# If you don't chown here, in some cases the owning user is root and you won't have access to any ressources.
COPY --chown=node . /home/node/app

RUN run-npm-install
