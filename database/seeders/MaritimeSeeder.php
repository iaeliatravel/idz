<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MaritimeSeeder extends Seeder
{
    public function run(): void
    {
        // 1. CORSICA LINEA
        $corsicaId = DB::table('maritime_companies')->insertGetId([
            'name' => 'Corsica Linea',
            'notes' => 'Traversées confortables régulières entre la France et l\'Algérie.',
            'created_at' => now(), 'updated_at' => now()
        ]);
        $this->insertRoutes($corsicaId, [
            ['Alger', 'Marseille'], ['Bejaïa', 'Marseille'], ['Skikda', 'Marseille'],
            ['Skikda', 'Sète'], ['Bejaïa', 'Sète']
        ]);

        // 2. NOURIS EL BAHR
        $nourisId = DB::table('maritime_companies')->insertGetId([
            'name' => 'Nouris El Bahr',
            'notes' => 'Nouvelle compagnie maritime desservant Marseille et Alicante.',
            'created_at' => now(), 'updated_at' => now()
        ]);
        $this->insertRoutes($nourisId, [
            ['Alger', 'Marseille'], ['Bejaïa', 'Marseille'], ['Alger', 'Alicante'],
            ['Oran', 'Alicante'], ['Marseille', 'Bejaïa'], ['Alicante', 'Alger'], ['Alicante', 'Oran']
        ]);

        // 3. BALEARIA
        $baleariaId = DB::table('maritime_companies')->insertGetId([
            'name' => 'Balearia',
            'notes' => 'Traversées régulières vers l\'Espagne (Valence et Barcelone).',
            'created_at' => now(), 'updated_at' => now()
        ]);
        $this->insertRoutes($baleariaId, [
            ['Alger', 'Barcelone'], ['Alger', 'Valence'], ['Mostaganem', 'Valence'],
            ['Oran', 'Valence'], ['Oran', 'Barcelone']
        ]);

        // 4. MADAR MARITIME COMPANY (MMC)
        $mmcId = DB::table('maritime_companies')->insertGetId([
            'name' => 'Madar Maritime Company (MMC)',
            'notes' => 'Départs réguliers chaque lundi et vendredi (Saison estivale jusqu\'au 15 septembre).',
            'created_at' => now(), 'updated_at' => now()
        ]);
        $this->insertRoutes($mmcId, [
            ['Alger', 'Alicante'], ['Oran', 'Alicante']
        ]);

        // 5. GNV
        $gnvId = DB::table('maritime_companies')->insertGetId([
            'name' => 'Grandi Navi Veloci (GNV)',
            'notes' => 'Traversées directes vers Sète.',
            'created_at' => now(), 'updated_at' => now()
        ]);
        $this->insertRoutes($gnvId, [
            ['Bejaïa', 'Sète'], ['Alger', 'Sète']
        ]);
    }

    private function insertRoutes($companyId, $ports)
    {
        foreach ($ports as $port) {
            DB::table('maritime_routes')->insert([
                'company_id' => $companyId,
                'departure_port' => $port[0],
                'arrival_port' => $port[1],
                'is_round_trip' => true,
                'created_at' => now(), 'updated_at' => now()
            ]);
        }
    }
}