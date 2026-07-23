<?php

namespace App\Console\Commands;

use App\Models\Admin;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateAdminCommand extends Command
{
    protected $signature = 'admin:create';

    protected $description = 'Crée un compte administrateur pour le Dashboard Aelia Travel';

    public function handle(): int
    {
        $this->info("\n🔐  Création du compte administrateur Aelia Travel\n");

        $fullName = $this->ask('Nom complet');
        $email = mb_strtolower(trim($this->ask('Email admin')));
        $password = $this->secret('Mot de passe (min 8 caractères)');

        if (mb_strlen($password) < 8) {
            $this->error('Mot de passe trop court.');

            return self::FAILURE;
        }

        if (Admin::where('email', $email)->exists()) {
            $this->error('Un admin avec cet email existe déjà.');

            return self::FAILURE;
        }

        $admin = Admin::create([
            'full_name' => $fullName,
            'email' => $email,
            'password_hash' => Hash::make($password),
            'role' => 'superadmin',
        ]);

        $this->info("\n✅  Admin créé avec succès (ID: {$admin->id})");
        $this->info("   Email : {$email}");
        $this->info('   URL   : '.config('app.url')."/admin\n");

        return self::SUCCESS;
    }
}
