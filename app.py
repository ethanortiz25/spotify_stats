from flask import Flask, request, render_template, redirect, session
import spotipy
from spotipy.oauth2 import SpotifyOAuth, CacheFileHandler

app = Flask(__name__)
ip = "ethanortiz.azurewebsites.net"
url = 'http://' + ip # + ":80"

app.secret_key = b'MAKEITSTOPMAKEITSTOP'
client_id = '05d1acf34f664eb8a4df5132a5de17e1'
client_secret = '191ef9f2fdad47258215d41ae29e1601'
redirect_uri = url + '/callback'

class NoCacheHandler(CacheFileHandler):
    def __init__(self):
        pass

    def get_cached_token(self):
        return None

    def save_token_to_cache(self, token_info):
        pass

    def delete_cached_token(self):
        pass

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login')
def login():
    sp_oauth = SpotifyOAuth(client_id=client_id, client_secret=client_secret, redirect_uri=redirect_uri, scope='user-read-private user-top-read user-library-read', cache_handler=NoCacheHandler())
    auth_url = sp_oauth.get_authorize_url()
    return redirect(auth_url)

@app.route('/callback')
def callback():
    try:
        auth_code = request.args.get('code')
        print(auth_code)
        sp_oauth = SpotifyOAuth(client_id=client_id, client_secret=client_secret, redirect_uri=redirect_uri, scope='user-read-private user-top-read user-library-read', cache_handler=NoCacheHandler())
        token_info = sp_oauth.get_access_token(code=auth_code)
        access_token = token_info['access_token']

        sp = spotipy.Spotify(auth=access_token)
        top_tracks_short = sp.current_user_top_tracks(limit=50, time_range='short_term')
        top_tracks_medium = sp.current_user_top_tracks(limit=50, time_range='medium_term')
        top_tracks_long = sp.current_user_top_tracks(limit=50, time_range='long_term')
        
        top_songs_short = []
        i = 1
        for track in top_tracks_short['items']:
            song_name = format_song_name(track['name'])
            album_artwork = track['album']['images'][0]['url'] if track['album']['images'] else None
            artists = ", ".join([artist["name"] for artist in track["artists"]])
            album_name = track["album"]["name"]
            song_length = format_ms(track['duration_ms'])

            top_songs_short.append({'name': song_name, 'artwork': album_artwork, 'rank': i, "artists": artists, "album_name": album_name, "song_length": song_length})
            i += 1

        i = 1
        top_songs_medium = []
        for track in top_tracks_medium['items']:
            song_name = format_song_name(track['name'])
            album_artwork = track['album']['images'][0]['url'] if track['album']['images'] else None
            artists = ", ".join([artist["name"] for artist in track["artists"]])
            album_name = track["album"]["name"]
            song_length = format_ms(track['duration_ms'])

            top_songs_medium.append({'name': song_name, 'artwork': album_artwork, 'rank': i, "artists": artists, "album_name": album_name, "song_length": song_length})
            i += 1

        i = 1
        top_songs_long = []
        for track in top_tracks_long['items']:
            song_name = format_song_name(track['name'])
            album_artwork = track['album']['images'][0]['url'] if track['album']['images'] else None
            artists = ", ".join([artist["name"] for artist in track["artists"]])
            album_name = track["album"]["name"]
            song_length = format_ms(track['duration_ms'])

            top_songs_long.append({'name': song_name, 'artwork': album_artwork, 'rank': i, "artists": artists, "album_name": album_name, "song_length": song_length})
            i += 1
        
        # Render the callback template with the top_songs variable
        return render_template('callback.html', top_songs_short=top_songs_short, top_songs_long=top_songs_long,top_songs_medium=top_songs_medium)
    except Exception as e:
        print(f"An error occurred: {e}")
        return redirect('/login')

@app.errorhandler(Exception)
def handle_error(error):
    print(f"An error occurred: {error}")
    return redirect('/')

def format_ms(ms):
    s = ms // 1000

    min = s // 60
    sec = s % 60
    sec_str = f"{sec}"
    if sec < 10:
        sec_str = "0" + sec_str

    
    return f"{min}:{sec_str}"

def format_song_name(name):
    i = 0
    for c in name:
        if c == '(':
            return (name[:i])
        i += 1
    return name


if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0')
