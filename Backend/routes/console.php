<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;

Artisan::command('wba:create-admin {--generate : Generate credentials for a local administrator}', function () {
    if (User::where('access_level', 'admin')->where('is_active', true)->exists()) {
        $this->error('An active administrator already exists. Create additional users from Manage Accounts.');

        return 1;
    }
    $generate = $this->option('generate');
    if ($generate && ! app()->environment('local')) {
        $this->error('Generated local accounts are only available in the local environment.');

        return 1;
    }
    $name = $generate ? 'Local Administrator' : $this->ask('Administrator name');
    $email = $generate ? 'admin@wba.local' : strtolower(trim($this->ask('Administrator email')));
    $password = $generate ? Str::random(24) : $this->secret('Password (at least 12 characters)');
    $validator = validator(compact('name', 'email', 'password'), [
        'name' => 'required|string|max:200', 'email' => 'required|email|unique:users,email',
        'password' => 'required|string|min:12|max:128',
    ]);
    if ($validator->fails()) {
        $this->error($validator->errors()->first());

        return 1;
    }
    User::create(['name' => $name, 'email' => $email, 'password' => $password,
        'access_level' => 'admin', 'role' => 'Admin', 'department' => 'System & User Management',
        'initials' => mb_strtoupper(mb_substr($name, 0, 1)), 'is_active' => true]);
    $this->info('Administrator created. Sign in through the Admin role.');
    if ($generate) {
        $this->line('Email: '.$email);
        $this->line('Password: '.$password);
    }

    return 0;
})->purpose('Create the first administrator without shipping default credentials');

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Scheduled background task: checks and permanently removes accounts exceeding the 30-day recovery period
\Illuminate\Support\Facades\Schedule::command('accounts:purge-expired')->daily();

