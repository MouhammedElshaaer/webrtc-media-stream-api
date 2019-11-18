# Baisc video chatting using webRTC MediaStream API

## Run the app

* Clone the repo
* cd to the project root folder
* create .env file and configure sqlite db connection

    ```bash
    cp .env.example .env
    ```

* install composer dependencies

    ```bash
    composer update
    ```

* install npm dependencies

    ```bash
    npm install
    ```

* generate a key for your application

    ```bash
    php artisan key:generate
    ```

* create a file for your SQLite database

    ```bash
    touch database/database.sqlite
    ```

* run migration, make sure to have the sqlite driver installed

    ```bash
    php artisan migrate
    ```

* run webpack and watch for changes

    ```bash
    npm run watch
    ```

* run the server

    ```bash
    php artisan serve
    ```
