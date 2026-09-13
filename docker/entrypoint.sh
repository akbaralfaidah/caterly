#!/bin/sh

set -eu

mkdir -p \
    storage/app/private \
    storage/app/public \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

chown -R www-data:www-data storage bootstrap/cache

if [ ! -L public/storage ]; then
    rm -rf public/storage
    php artisan storage:link
fi

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    attempt=1

    until php artisan migrate --force; do
        if [ "$attempt" -ge 12 ]; then
            echo "Database migration failed after $attempt attempts." >&2
            exit 1
        fi

        echo "Database is not ready; retrying migration in 5 seconds ($attempt/12)." >&2
        attempt=$((attempt + 1))
        sleep 5
    done
fi

php artisan optimize

exec "$@"
