# SPDX-License-Identifier: BSD-3-Clause
#
# Copyright (c) 2021, Unikraft UG.  All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions
# are met:
#
# 1. Redistributions of source code must retain the above copyright
#    notice, this list of conditions and the following disclaimer.
# 2. Redistributions in binary form must reproduce the above copyright
#    notice, this list of conditions and the following disclaimer in the
#    documentation and/or other materials provided with the distribution.
# 3. Neither the name of the author nor the names of any co-contributors
#    may be used to endorse or promote products derived from this software
#    without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS ``AS IS'' AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
# IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
# ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE
# FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
# DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
# OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
# HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
# LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
# OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
# SUCH DAMAGE.
ARG DEBIAN_VERSION=bookworm-20230725

FROM debian:${DEBIAN_VERSION} AS devenv

LABEL MAINTAINER="Alexander Jung <alex@unikraft.io>"

ARG BUILD_REF=latest
ARG NODE_VERSION=20

ENV NODE_ENV=development

RUN mkdir /ide-vscode
WORKDIR /ide-vscode
COPY . /ide-vscode

RUN set -xe; \
    apt-get update; \
    apt-get install -y \
      curl \
      make \
      g++ \
      lsb-release \
      gnupg; \
    curl -sLf -o /dev/null "https://deb.nodesource.com/node_${NODE_VERSION}.x/dists/bookworm/Release"; \
    curl -s https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add -; \
    curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -; \
    echo "deb https://deb.nodesource.com/node_${NODE_VERSION}.x buster main" > /etc/apt/sources.list.d/nodesource.list; \
    echo "deb-src https://deb.nodesource.com/node_${NODE_VERSION}.x buster main" >> /etc/apt/sources.list.d/nodesource.list; \
    apt-get update; \
    apt-get install -y \
      nodejs; \
    npm install; \
    npm install -g @vscode/vsce
