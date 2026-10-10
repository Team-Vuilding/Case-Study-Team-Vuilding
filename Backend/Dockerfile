FROM dunglas/frankenphp:1-php8.4-bookworm

RUN install-php-extensions pdo_pgsql pdo_sqlite mbstring intl bcmath zip opcache
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

WORKDIR /app
ENV APP_ENV=production APP_DEBUG=false DB_CONNECTION=pgsql \
    LOG_CHANNEL=stderr CACHE_STORE=database SESSION_DRIVER=database \
    QUEUE_CONNECTION=sync PORT=10000

COPY . /app
RUN cp /usr/local/etc/php/php.ini-production /usr/local/etc/php/php.ini \
    && setcap -r /usr/local/bin/frankenphp \
    && composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader \
    && mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs \
    && chown -R www-data:www-data storage bootstrap/cache /data /config \
    && chmod +x render-entrypoint.sh

USER www-data
EXPOSE 10000
ENTRYPOINT ["/app/render-entrypoint.sh"]
CMD ["frankenphp", "run", "--config", "/app/Caddyfile", "--adapter", "caddyfile"]
