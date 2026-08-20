# Temporary production image for Railway (backend API + Reverb websocket service).
# Both Railway services (api, reverb) use this same image — the process that
# runs is chosen by the "Start Command" set per-service (see DEPLOYMENT.md).

FROM php:8.4-cli-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libzip-dev \
        libonig-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath zip \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /var/www/backend

COPY . .
RUN composer install --no-dev --optimize-autoloader

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
    && chmod -R 775 storage bootstrap/cache

ENTRYPOINT ["/entrypoint.sh"]
CMD ["web"]
