<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    // Apply CORS rules to all REST API endpoints
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // Allowed HTTP methods for RESTful actions
    'allowed_methods' => ['*'],

    // Allow frontend client (WBA Vite development server)
    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],

    'allowed_origins_patterns' => [],

    // Allow headers like Authorization, Content-Type, Accept, etc.
    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Set to true if sending session cookies / Sanctum tokens
    'supports_credentials' => true,

];
