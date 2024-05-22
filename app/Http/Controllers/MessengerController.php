<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class MessengerController extends Controller
{
    public function index() {
        return view('messenger.index');
    }

    public function searchUser(Request $request) {
        $getRecords = null;
        $searchString = $request->searchString;
        $records = User::where('id', '!=', auth()->user()->id)
        ->where('name', 'LIKE', "%{$searchString}%")
        ->orWhere('username', 'LIKE', "%{$searchString}%")
        ->get();

        foreach($records as $record) {
            $getRecords .= view('messenger.components.user-search-item', compact('record'))->render();
        }

        return response()->json([
            'records' => $getRecords,
        ]);
    }
}
