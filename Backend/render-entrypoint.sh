#!/bin/sh
set -eu

: "${APP_KEY:?Set a persistent APP_KEY in Render environment settings}"

php artisan config:cache --no-interaction
php artisan migrate --force --no-interaction

if [ -n "${WBA_ADMIN_EMAIL:-}" ]; then
    php artisan wba:create-admin --from-env --no-interaction
fi

php artisan accounts:purge-expired --no-interaction
php artisan schedule:work --no-interaction &

exec "$@"
