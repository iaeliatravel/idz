<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\Setting;
use Illuminate\Http\Request;

class GeneralAdminController extends Controller
{
    public function messagesIndex()
    {
        return response()->json(
            ContactMessage::orderByDesc('created_at')->limit(100)->get()
        );
    }

    public function messagesMarkRead(ContactMessage $message)
    {
        $message->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }

    public function settingsIndex()
    {
        return response()->json(
            Setting::all()->pluck('setting_value', 'setting_key')
        );
    }

    public function settingsUpdate(Request $request)
    {
        foreach ($request->all() as $key => $value) {
            Setting::set($key, is_string($value) ? $value : json_encode($value));
        }

        return response()->json(['success' => true]);
    }
}
