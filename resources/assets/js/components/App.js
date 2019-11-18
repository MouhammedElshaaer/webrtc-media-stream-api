import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import MediaHandler from '../MediaHandler';
import Pusher from 'pusher-js';
import Peer from 'simple-peer';

const APP_KEY = '4ababde73a87fcc2ddff';

export default class App extends Component {
    constructor() {
        super();

        this.state = {
            hasMedia: false,
            otherUserId: null
        };

        this.getUsers();

        this.user = window.user;
        this.user.stream = null;
        this.peers = {};

        this.mediaHandler = new MediaHandler();
        this.setupPusher();

        this.callTo = this.callTo.bind(this);
        this.setupPusher = this.setupPusher.bind(this);
        this.startPeer = this.startPeer.bind(this);
    }

    async getUsers() {
        
        const response = await fetch('/users');
        const data = response.json();
        data.then(data => this.users = data.users);
        // data.then(data => console.log(data.users));

    }

    componentWillMount() {
        this.mediaHandler.getPermissions()
            .then((stream) => {
                this.setState({hasMedia: true});
                this.user.stream = stream;

                try {
                    this.myVideo.srcObject = stream;
                } catch (e) {
                    this.myVideo.src = URL.createObjectURL(stream);
                }

                this.myVideo.play();
            })
    }

    setupPusher() {
        this.pusher = new Pusher(APP_KEY, {
            authEndpoint: '/pusher/auth',
            cluster: 'eu',
            auth: {
                params: this.user.id,
                headers: {
                    'X-CSRF-Token': window.csrfToken
                }
            }
        });

        this.channel = this.pusher.subscribe('presence-video-channel');

        this.channel.bind(`client-signal-${this.user.id}`, (signal) => {
            let peer = this.peers[signal.userId];

            // if peer is not already exists, we got an incoming call
            if(peer === undefined) {
                this.setState({otherUserId: signal.userId});
                peer = this.startPeer(signal.userId, false);
            }

            peer.signal(signal.data);
        });
    }

    startPeer(userId, initiator = true) {
        const peer = new Peer({
            initiator,
            stream: this.user.stream,
            trickle: false
        });

        peer.on('signal', (data) => {
            this.channel.trigger(`client-signal-${userId}`, {
                type: 'signal',
                userId: this.user.id,
                data: data
            });
        });

        peer.on('stream', (stream) => {
            try {
                this.userVideo.srcObject = stream;
            } catch (e) {
                this.userVideo.src = URL.createObjectURL(stream);
            }

            this.userVideo.play();
        });

        peer.on('close', () => {
            let peer = this.peers[userId];
            if(peer !== undefined) {
                peer.destroy();
            }

            this.peers[userId] = undefined;
        });

        return peer;
    }

    callTo(userId) {
        this.peers[userId] = this.startPeer(userId);
    }

    render() {

        if (this.users) {
            return (
                <div className="App">

                    
                    <ul className="users">
                        
                        {
                            this.users.map((user) => {
                                return this.user.id !== user.id?
                                    <li key={user.id} onClick={() => this.callTo(user.id)}>Call {user.name}</li>
                                    :null;
                            })
                        }

                    </ul>
                    <div className="video-container">
                        <video className="my-video" ref={(ref) => {this.myVideo = ref;}}></video>
                        <video className="user-video" ref={(ref) => {this.userVideo = ref;}}></video>
                    </div>
                </div>
            );

        } else {

            return (
                <div className="App">
                    <div className="video-container">
                        <video className="my-video" ref={(ref) => {this.myVideo = ref;}}></video>
                        <video className="user-video" ref={(ref) => {this.userVideo = ref;}}></video>
                    </div>
                </div>
            );
        }

    }
}

if (document.getElementById('app')) {
    ReactDOM.render(<App />, document.getElementById('app'));
}
