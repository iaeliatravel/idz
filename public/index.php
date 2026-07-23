<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Détermine si l'application est en mode maintenance...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Charge l'autoloader Composer...
require __DIR__.'/../vendor/autoload.php';

// Démarre l'application Laravel...
(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Request::capture());
