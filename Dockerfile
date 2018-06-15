FROM python:2.7-jessie

ENV PYTHONUNBUFFERED 1

# Setup Debian linux
RUN export DEBIAN_FRONTEND=noninteractive

# This section is borrowed from the official Django image but adds GDAL and others
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
     apt-get update && apt-get install -y \
		gcc \
		gettext \
		postgresql-client libpq-dev \
		sqlite3 \
        python-gdal python-psycopg2 \
        python-imaging python-lxml \
        python-dev libgdal-dev \
        python-ldap \
        libmemcached-dev libsasl2-dev zlib1g-dev \
        python-pylibmc \
        curl nodejs\
	    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --upgrade pip

# python-gdal does not seem to work, let's install manually the version that is
# compatible with the provided libgdal-dev
RUN pip install GDAL==1.10 --global-option=build_ext --global-option="-I/usr/include/gdal"

RUN mkdir /app
WORKDIR /app

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt --src /usr/local/src

COPY package.json /app/package.json
RUN npm install

# Main work directory will be app
COPY . /app

# Transpile JS for IE
RUN npm run babel

COPY ./start.sh /start.sh
COPY ./celary.sh /celary.sh
COPY ./entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r//' /celary.sh \
    && sed -i 's/\r//' /start.sh \
    && sed -i 's/\r//' /entrypoint.sh \
    && chmod +x /entrypoint.sh \
    && chmod +x /celary.sh \
    && chmod +x /start.sh

ENTRYPOINT ["/entrypoint.sh"]
