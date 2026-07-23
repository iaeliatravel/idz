<?php

namespace App\Support;

class RefGenerator
{
    public static function generate(string $prefix): string
    {
        $year = date('Y');
        $rand = random_int(100000, 999999);

        return "{$prefix}-{$year}-{$rand}";
    }

    public static function evisa(): string
    {
        return self::generate('EV');
    }

    public static function omra(): string
    {
        return self::generate('OM');
    }
}
