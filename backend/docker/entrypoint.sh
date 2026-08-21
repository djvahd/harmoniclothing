#!/bin/sh
set -e

php artisan config:clear

if [ "$1" = "web" ]; then
    php artisan migrate --force
    [ -L public/storage ] || php artisan storage:link
    exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"
elif [ "$1" = "reverb" ]; then
    exec php artisan reverb:start --host=0.0.0.0 --port="${PORT:-8080}"
else
    echo "Unknown process type: $1 (expected 'web' or 'reverb')" >&2
    exit 1
fi
