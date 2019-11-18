<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use \Pusher\Pusher;

use App\User;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('home');
    }

    public function authenticate(Request $request) {
        $socketId = $request->socket_id;
        $channelName = $request->channel_name;

        $appKey = '4ababde73a87fcc2ddff';
        $appSecret = '7558441caad0b0889c18';
        $appId = '901368';

        $pusher = new Pusher($appKey, $appSecret, $appId, [
            'cluster' => 'eu',
            'encrypted' => true
        ]);

        $presence_data = ['name' => auth()->user()->name];
        $key = $pusher->presence_auth($channelName, $socketId, auth()->id(), $presence_data);

        return response($key);
    }

    public function getUsers() {

        $users = User::all();
        return response()->json(['users' => $users]);

    }
}
