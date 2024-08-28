from flask import Flask, request, render_template, redirect, jsonify, abort
import spotipy
from spotipy.oauth2 import SpotifyOAuth, CacheFileHandler
from datetime import datetime
from wordleCalculator import treeTreversal, cache_storage, runAll

app = Flask(__name__)
# ip = "ethanortiz.azurewebsites.net"
# url = "http://127.0.0.1:5000"
url = 'https://' + "ethanortiz.azurewebsites.net"  # + ":80"

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
sp_oauth = SpotifyOAuth(client_id=client_id, client_secret=client_secret, redirect_uri=redirect_uri, scope='user-top-read user-read-recently-played', cache_handler=NoCacheHandler())


@app.route('/save_data', methods=['POST'])
def save_data():
    data = request.get_json()

    # Extract the text and colors from the data
    words = data.get('words', [])
    colors = data.get('colors', [])
    results = []
    for i in range(len(words)):
        results.append((words[i].lower(), tuple(colors[i])))
    # print(results)
    
    
    validGuessFile = open('wordle/validGuess.txt', 'r')
    validAnswerFile = open('wordle/validAnswer.txt', 'r')
    validGuess = tuple(validGuessFile.read().split('\n'))
    validAnswer = validAnswerFile.read().split('\n')
    validAnswerFile.close()
    validGuessFile.close()

    # cachedTreeTreversal = cache_storage('wordle/cache/tree')(treeTreversal)
    nextWord = treeTreversal(results, validGuess, validAnswer)[0]
    if nextWord == "":
        return abort(500)

    processed_data = []
    for letter in nextWord:
        processed_data.append({'text': letter})

    response = {'message': 'Data received and processed successfully', 'processedData': processed_data}
    return jsonify(response)

@app.route('/')
def home():
    return render_template('index_new.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/portfolio')
def portfolio():
    return render_template('portfolio.html')

@app.route('/service')
def service():
    return render_template('service.html')

@app.route('/login')
def login():
    auth_url = sp_oauth.get_authorize_url()
    return redirect(auth_url)

@app.route('/wordle_solver')
def wordle_solver():
    return render_template('wordle_solver.html')

@app.route('/callback')
def callback():
    try:
        auth_code = request.args.get('code')
        sp_oauth = SpotifyOAuth(client_id=client_id, client_secret=client_secret, redirect_uri=redirect_uri, scope='user-top-read user-read-recently-played', cache_handler=NoCacheHandler())
        token_info = sp_oauth.get_access_token(code=auth_code)
        access_token = token_info['access_token']

        sp = spotipy.Spotify(auth=access_token)
        top_tracks_short = sp.current_user_top_tracks(limit=50, time_range='short_term')
        top_tracks_medium = sp.current_user_top_tracks(limit=50, time_range='medium_term')
        top_tracks_long = sp.current_user_top_tracks(limit=50, time_range='long_term')
        recently_played = sp.current_user_recently_played(limit=50)
        
        top_songs_short = []
        i = 1
        for track in top_tracks_short['items']:
            song_name = format_song_name(track['name'])
            album_artwork = track['album']['images'][0]['url'] if track['album']['images'] else None
            artists = ", ".join([artist["name"] for artist in track["artists"]])
            album_name = track["album"]["name"]
            song_length = format_ms(track['duration_ms'])
            song_url = track['external_urls']['spotify']

            top_songs_short.append({'name': song_name, 'artwork': album_artwork, 'rank': i, "artists": artists, "album_name": album_name, "song_length": song_length, "song_url" : song_url})
            i += 1

        i = 1
        top_songs_medium = []
        for track in top_tracks_medium['items']:
            song_name = format_song_name(track['name'])
            album_artwork = track['album']['images'][0]['url'] if track['album']['images'] else None
            artists = ", ".join([artist["name"] for artist in track["artists"]])
            album_name = track["album"]["name"]
            song_length = format_ms(track['duration_ms'])
            song_url = track['external_urls']['spotify']

            top_songs_medium.append({'name': song_name, 'artwork': album_artwork, 'rank': i, "artists": artists, "album_name": album_name, "song_length": song_length, "song_url" : song_url})
            i += 1

        i = 1
        top_songs_long = []
        for track in top_tracks_long['items']:
            song_name = format_song_name(track['name'])
            album_artwork = track['album']['images'][0]['url'] if track['album']['images'] else None
            artists = ", ".join([artist["name"] for artist in track["artists"]])
            album_name = track["album"]["name"]
            song_length = format_ms(track['duration_ms'])
            song_url = track['external_urls']['spotify']

            top_songs_long.append({'name': song_name, 'artwork': album_artwork, 'rank': i, "artists": artists, "album_name": album_name, "song_length": song_length, "song_url" : song_url})
            i += 1


        i = 1
        top_songs_recent = []
        for recent in recently_played['items']:
            track = recent['track']
            song_name = format_song_name(track['name'])
            album_artwork = track['album']['images'][0]['url'] if track['album']['images'] else None
            artists = ", ".join([artist["name"] for artist in track["artists"]])
            album_name = track["album"]["name"]
            song_length = format_ms(track['duration_ms'])
            song_url = track['external_urls']['spotify']
            timestamp = recent['played_at']
            try:
                timestamp_utc = datetime.strptime(timestamp, "%Y-%m-%dT%H:%M:%S.%fZ")
            except:
                timestamp_utc = datetime.strptime(timestamp, "%Y-%m-%dT%H:%M:%SZ")

            time_difference = datetime.utcnow() - timestamp_utc
            hours = int(time_difference.total_seconds() // 3600)
            minutes = int((time_difference.total_seconds() % 3600) // 60)

            if hours > 0:
                timestamp_local = f"{hours} hours ago"
                if hours == 1:
                    timestamp_local = f"{hours} hour ago"

            else:
                timestamp_local = f"{minutes} mins ago"
                if minutes == 1:
                    timestamp_local = f"{minutes} min ago"
                if minutes == 0:
                    timestamp_local = "just now"
            # timestamp_local = timestamp_utc.strftime("%Y-%m-%d %H:%M:%S")[5:-3].replace('-','/')
            # if timestamp_local[6] == '0':
            #     timestamp_local = timestamp_local[:6] + timestamp_local[7:] 

            # if timestamp_local[0] == '0':
            #     timestamp_local = timestamp_local[1:]

            top_songs_recent.append({'name': song_name, 'artwork': album_artwork, 'time_played': timestamp_local, "artists": artists, "album_name": album_name, "song_length": song_length, "song_url" : song_url})
            i += 1
        
        # Render the callback template with the top_songs variable
        return render_template('callback.html', top_songs_short=top_songs_short, top_songs_long=top_songs_long,top_songs_medium=top_songs_medium, top_songs_recent=top_songs_recent)
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
    app.run()
