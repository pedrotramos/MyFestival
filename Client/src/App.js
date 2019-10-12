import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import "./static/App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import SpotifyWebApi from 'spotify-web-api-js';
import request from 'request';
import standard from './static/standard.png';

var spotifyApi = new SpotifyWebApi();

function getHashParams() {
  var hashParams = {};
  var e, r = /([^&;=]+)=?([^&;]*)/g,
    q = window.location.hash.substring(1);
  e = r.exec(q)
  while (e) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
    e = r.exec(q);
  }
  return hashParams;
}

function App() {

  const token = getHashParams().access_token;
  if (token) {
    spotifyApi.setAccessToken(token);
  }
  const [user, setUser] = useState();
  const [playlist, setPlaylist] = useState();

  //User information
  useEffect(() => {
    const getUser = async () => {
      spotifyApi.getMe().then((data) => {
        setUser(data);
      })
    }
    const token = spotifyApi.getAccessToken();
    if (token) {
      getUser();
    }
  }, []);

  //Playlist information
  useEffect(() => {
    const getPlaylist = async () => {
      var options = {
        url: 'https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=50',
        headers: { 'Authorization': 'Bearer ' + spotifyApi.getAccessToken() },
        json: true
      };

      request.get(options, (error, response, body) => {
        setPlaylist(body.items);
      });
    }
    const token = spotifyApi.getAccessToken();
    if (token) {
      getPlaylist();
    }
  }, []);

  if (playlist && user && token) {
    return (
      <div className="app">
        <div>
          <Header title="My Festival" />
        </div>
        <span className="user">
          {typeof (user.images[0]) !== "undefined" && (
            <img src={user.images[0].url} className='user-img' width="60" height="60" alt='user pic' />
          )}
          {typeof (user.images[0]) === "undefined" && (
            <img src={standard} className='user-img' width="60" height="60" alt='user pic' />
          )}
          <div className="user-infos">
            <p>Logged in as {user.display_name}</p>
            <p>{user.email}</p>
          </div>
        </span>
        <a href='localhost:3000' className="link logout" >Logout</a>
        <div className="list">{playlist.map((obj, index) => {
          return (
            <div className="cartao" key={index}>
              <h1>{index + 1}</h1>
              <div className="conteudo">
                <p key={"Track"}>Track: {playlist[index].name}</p>
                <p key={"Artist"}>Artists: {playlist[index].artists[0].name}</p>
                <p key={"Album"}>Album: {playlist[index].album.name}</p>
              </div>
              <img src={playlist[index].album.images[0].url} width="60" height="60" alt="album pic" />
            </div>
          );
        })}
        </div>
      </div >
    );
  }

  return (
    <div className="app">
      <div>
        <Header title="My Festival" />
      </div>
      <span className="user">
        <a href='localhost:8888/login' className="link" >Login with Spotify</a>
      </span>
    </div >
  );
}

export default App;
