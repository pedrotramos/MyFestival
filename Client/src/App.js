import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import "./static/App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import SpotifyWebApi from "spotify-web-api-js";
import request from "request";
import standard from "./static/standard.png";

var spotifyApi = new SpotifyWebApi();

function getHashParams() {
  var hashParams = {};
  var e,
    r = /([^&;=]+)=?([^&;]*)/g,
    q = window.location.hash.substring(1);
  e = r.exec(q);
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
  const [search, setSearch] = useState("");
  const [myFestival, setMyFestival] = useState();
  const [term, setTerm] = useState();
  const [hover, setHover] = useState(false);

  //User information
  useEffect(() => {
    spotifyApi.getMe().then(data => {
      setUser(data);
    });
  }, []);

  //Playlist information
  useEffect(() => {
    getTerm("short_term");
  }, []);

  const getTerm = e => {
    var options = {
      url: `https://api.spotify.com/v1/me/top/tracks?time_range=${e}&limit=50`,
      headers: { Authorization: "Bearer " + spotifyApi.getAccessToken() },
      json: true
    };

    request.get(options, (error, response, body) => {
      setPlaylist(body.items);
      setTerm(e);
    });
  };

  if (playlist && user && token) {
    for (var i = 0; i < playlist.length; i++) {
      var ranking = i + 1;
      playlist[i]["ranking"] = ranking;
    }
    const filteredData = playlist.filter(item => {
      return item.name.toLowerCase().includes(search.toLowerCase());
    });

    const createPlaylist = () => {
      spotifyApi.getUserPlaylists(user.id).then(data => {
        for (var i = 0; i < data.items.length; i++) {
          if (data.items[i].name !== "myFestival") {
            setMyFestival("notFound");
          } else {
            setMyFestival(data.items[i].id);
            var l = [];
            for (var j = 0; j < playlist.length; j++) {
              l.push(playlist[j].uri);
            }
            spotifyApi.addTracksToPlaylist(data.items[i].id, l);
            break;
          }
        }
      });
    };

    return (
      <div className="app">
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
        ></link>
        <div>
          <Header title1="my" title2="Festival" />
        </div>
        <span className="user">
          {typeof user.images[0] !== "undefined" && (
            <img
              src={user.images[0].url}
              className="user-img"
              width="60"
              height="60"
              alt="user pic"
            />
          )}
          {typeof user.images[0] === "undefined" && (
            <img
              src={standard}
              className="user-img"
              width="60"
              height="60"
              alt="user pic"
            />
          )}
          <div className="user-infos">
            <p>Logged in as {user.display_name}</p>
            <p>{user.email}</p>
          </div>
        </span>
        {term === "short_term" && (
          <p>
            <button
              className="term"
              onClick={() => getTerm("medium_term")}
              variant="secondary"
            >
              Last 6 months
            </button>
            <button className="term" onClick={() => getTerm("long_term")}>
              All-time
            </button>
          </p>
        )}
        {term === "medium_term" && (
          <p>
            <button className="term" onClick={() => getTerm("short_term")}>
              Last 4 weeks
            </button>
            <button className="term" onClick={() => getTerm("long_term")}>
              All-time
            </button>
          </p>
        )}
        {term === "long_term" && (
          <p>
            <button className="term" onClick={() => getTerm("short_term")}>
              Last 4 weeks
            </button>
            <button className="term" onClick={() => getTerm("medium_term")}>
              Last 6 months
            </button>
          </p>
        )}
        <p>
          <button className="create" onClick={() => createPlaylist()} onMouseEnter={() => setHover(!hover)} onMouseLeave={() => setHover(!hover)}>
            Create myFestival Playlist!
          </button>
        </p>
        {typeof myFestival !== "undefined" && myFestival !== "notFound" && (
          <p>Created myFestival!</p>
        )}
        {myFestival === "notFound" && <p>Playlist not found...</p>}
        {hover && (
          <div>
            <h6>Instructions</h6>
            <li>
              Create a playlist named <code>myFestival</code>
            </li>
            <li>Set it to public</li>
            <li>Enjoy!</li>
          </div>
        )}
        <input
          className="search"
          type="text"
          onChange={e => setSearch(e.target.value)}
          placeholder="&#xF002;    Search Track Name..."
          value={search}
        />
        <div className="list">
          {filteredData.map((obj, index) => {
            return (
              <div className="cartao" key={index}>
                <h1>{obj.ranking}</h1>
                <div className="conteudo">
                  <p>Track: {obj.name}</p>
                  <p>Artists: {obj.artists[0].name}</p>
                  <p>Album: {obj.album.name}</p>
                </div>
                <img
                  src={obj.album.images[0].url}
                  width="60"
                  height="60"
                  alt="album pic"
                />
              </div>
            );
          })}
        </div>
        <p>
          <a className="logout" href="localhost:3000">
            Logout
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="app">
      <div>
        <Header title1="my" title2="Festival" />
      </div>
      <span className="user">
        <a href="localhost:8888/login" className="link">
          Login with Spotify
        </a>
      </span>
    </div>
  );
}

export default App;
