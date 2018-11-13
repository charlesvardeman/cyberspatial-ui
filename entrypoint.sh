#!/bin/bash
set -e
cmd="$@"

# This entrypoint is used to play nicely with the current cookiecutter configuration.
# Since docker-compose relies heavily on environment variables itself for configuration, we'd have to define multiple
# environment variables just to support cookiecutter out of the box. That makes no sense, so this little entrypoint
# does all this for us.

function postgres_ready(){
python << END
import sys
import psycopg2
try:
    conn = psycopg2.connect(dbname="$GEONODE_DATABASE", user="$GEONODE_DATABASE_USER", password="$GEONODE_DATABASE_PASSWORD", host="$DATABASE_HOST")
except psycopg2.OperationalError:
    sys.exit(-1)
sys.exit(0)
END
}

until postgres_ready; do
 >&2 echo "Postgres is unavailable - sleeping"
 sleep 1
done

>&2 echo "Postgres is up - continuing..."
python manage.py migrate --noinput

python manage.py loaddata sample_admin
python manage.py loaddata default_oauth_apps_docker
python manage.py loaddata initial_data
python manage.py loaddata roles
python manage.py loaddata regionlevels
python manage.py loaddata counties
python manage.py loaddata municipalities
python manage.py loaddata admingroups
python manage.py loaddata geonodegroupprofiles
python manage.py loaddata usermeta

exec "$@"
