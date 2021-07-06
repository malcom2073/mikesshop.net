FROM ubuntu:20.04
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && \
    apt-get install -y locales && \
    localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8
ENV LANG en_US.UTF-8

ENV PYENV_ROOT="/.pyenv" \
    PATH="/.pyenv/bin:/.pyenv/shims:$PATH"

RUN apt-get update && \
    apt-get install -y --no-install-recommends git ca-certificates curl && \
    curl -L https://github.com/pyenv/pyenv-installer/raw/master/bin/pyenv-installer | bash

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        make build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev \
        libsqlite3-dev wget curl llvm libncurses5-dev xz-utils tk-dev \
        libxml2-dev libxmlsec1-dev libffi-dev \
        ca-certificates


RUN pyenv install 3.9.0
RUN pyenv global 3.9.0

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app/python
COPY . /usr/src/app/
RUN pip install -r /usr/src/app/python/requirements.txt
ENV PYTHONPATH=/usr/src/app/python:/usr/src/app:/usr/src/app/python/app
CMD sleep 10 && alembic upgrade head && python run.py