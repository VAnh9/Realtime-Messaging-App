<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessengerController extends Controller
{
    public function index() {
        return view('messenger.index');
    }

    public function searchUser(Request $request) {
        $getRecords = null;
        $searchString = $request->searchString;
        $records = User::where(function($query) use ($searchString) {
            $query->where('name', 'LIKE', "%{$searchString}%")
            ->orWhere('username', 'LIKE', "%{$searchString}%");
        })
        ->where('id', '!=', auth()->user()->id)
        ->paginate(10);

        if($records->total() < 1) {
            $getRecords .= "<p class='text-center nothing_found-text'>Nothing found!</p>";
        }

        foreach($records as $record) {
            $getRecords .= view('messenger.components.user-search-item', compact('record'))->render();
        }

        return response()->json([
            'records' => $getRecords,
            'lastPage' => $records->lastPage(),
        ]);
    }

    // fetch user by id
    public function fetchIdInfo(Request $request) {

        $user = User::where('id', $request->id)->first();

        return response()->json([
            'user' => $user,
        ]);
    }

    //send message
    public function sendMessage(Request $request) {
        $request->validate([
            'message' => ['required'],
            'id' => ['required', 'integer'],
            'tempMsgId' => ['required']
        ]);

        $message = new Message();
        $message->sender_id = Auth::user()->id;
        $message->receiver_id = $request->id;
        $message->message = $request->message;
        $message->save();

        return response()->json([
            'message' => $this->messageCard($message),
            'tempId' => $request->tempMsgId,
        ]);
    }

    function messageCard($message) {
        return view('messenger.components.message-card', compact('message'))->render();
    }
}
