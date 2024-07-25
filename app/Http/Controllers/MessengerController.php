<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use App\Traits\FileUploadTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessengerController extends Controller
{
    use FileUploadTrait;

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
            'message' => ['required_without:attachment'],
            'id' => ['required', 'integer'],
            'tempMsgId' => ['required'],
            'attachemnt' => ['nullable', 'max:1024', 'image']
        ]);

        $attachmentPath = $this->uploadFile($request, 'attachment');
        $message = new Message();
        $message->sender_id = Auth::user()->id;
        $message->receiver_id = $request->id;
        $message->message = $request->message;
        if($attachmentPath) {
            $message->attachment = json_encode($attachmentPath);
        }
        $message->save();

        return response()->json([
            'message' => $message->attachment ? $this->messageCard($message, true) : $this->messageCard($message),
            'tempId' => $request->tempMsgId,
        ]);
    }

    function messageCard($message, $attachment = false) {
        return view('messenger.components.message-card', compact('message', 'attachment'))->render();
    }

    // fetch messages from db
    function fetchMessage(Request $request) {
        $messages = Message::where('sender_id', Auth::user()->id)->where('receiver_id', $request->id)
            ->orWhere('sender_id', $request->id)->where('receiver_id', Auth::user()->id)
            ->latest()->paginate(20);

        $response = [
            'lastPage' => $messages->lastPage(),
            'messages' => '',
        ];

        $allMessages = '';
        foreach($messages->reverse() as $message) {
            $allMessages .= $this->messageCard($message, $message->attachment ? true : false);
        }

        $response['messages'] = $allMessages;

        return response()->json($response);
    }
}
