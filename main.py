import os
import requests
from flask import Flask, render_template

apiKey = '1e562fa9c998c5306da6e7b23bfd7138'


app = Flask(__name__)

@app.route('/')
def home():
    sections = []
    for showcase in showcases:
        apiResponse = apiCall(showcase['apiLink'])
        movies = apiResponse['results']
        for movie in movies:
            try:
                movie['release_date'] = convertDate(movie['release_date'])
            except:
                movie['release_date'] = ""
        sections.append({
            'title': showcase['title'],
            'movies': movies
        })
    # movies = apiCall(f'https://api.themoviedb.org/3/movie/top_rated?api_key={apiKey}&language=en-US&page=1')
    # movies = movies['results']

    return render_template('index.html', showcases=sections)

@app.route('/film/title/<id>')
def getMovie(id):
    movie = apiCall(f"https://api.themoviedb.org/3/movie/{id}?api_key={apiKey}&language=en-US")
    cast = apiCall(f"https://api.themoviedb.org/3/movie/{id}/credits?api_key={apiKey}&language=en-US")
    return render_template('movie.html', movie=movie, cast=cast)

@app.route('/person/<id>')
def getPerson(id):
    person = apiCall(f"https://api.themoviedb.org/3/person/{id}?api_key={apiKey}&language=en-US")
    credits = apiCall(f"https://api.themoviedb.org/3/person/{id}/movie_credits?api_key={apiKey}&language=en-US")
    unordered_credits = []
    for credit in credits['cast']:
        unordered_credits.append(credit)
    for movie in unordered_credits:
        try:
            movie['release_date'] = convertDate(movie['release_date'])
        except:
            movie['release_date'] = ""
    popular_credits = sorted(unordered_credits, key = lambda i: i['popularity'],reverse=True)
    popular_credits = popular_credits[:10]
    rated_credits = sorted(unordered_credits, key = lambda i: i['vote_average'],reverse=True)
    rated_credits = rated_credits[:10]
    return render_template('person.html', person=person, popular_credits=popular_credits, rated_credits=rated_credits)

@app.route('/search/<query>')
def search(query):
    return render_template('search.html')

def convertDate(date):
    if (date):
        date = date.split('-')
        year = date[0]
        month = int(date[1])
        day = date[2]
        months = [ "January", "February", "March", "April", "May", "June", 
            "July", "August", "September", "October", "November", "December" ]
        monthName = months[month - 1]
        return f"{monthName} {day}, {year}"
    else:
            return ""

showcases = [
    {
        'id': 'popular',
        'title': "What's Popular",
        'apiLink': f"https://api.themoviedb.org/3/discover/movie?api_key={apiKey}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_watch_monetization_types=flatrate"
    },
    {
        'id': 'nowPlaying',
        'title': "Now Playing",
        'apiLink': f"https://api.themoviedb.org/3/movie/now_playing?api_key={apiKey}&language=en-US&page=1"
    },
    {
        'id': 'upcoming',
        'title': "Upcoming",
        'apiLink': f"https://api.themoviedb.org/3/movie/upcoming?api_key={apiKey}&language=en-US&page=1"
    },
    {
        'id': 'topRated',
        'title': "Top Rated",
        'apiLink': f"https://api.themoviedb.org/3/movie/top_rated?api_key={apiKey}&language=en-US&page=1"
    },
]


def apiCall(url):
    response = requests.get(url)
    return response.json()


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
