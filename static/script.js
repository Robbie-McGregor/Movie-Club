const posters = 'https://image.tmdb.org/t/p/original/'
const apiKey = '1e562fa9c998c5306da6e7b23bfd7138'

let getMoreQty = 0

const base_url = "http://image.tmdb.org/t/p/"
const secure_base_url = "https://image.tmdb.org/t/p/"



const showcases = [
    {
        id: 'popular',
        title: "What's Popular",
        apiLink: `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_watch_monetization_types=flatrate`
    },
    {
        id: 'nowPlaying',
        title: "Now Playing",
        apiLink: `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US&page=1`
    },
    {
        id: 'upcoming',
        title: "Upcoming",
        apiLink: `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=en-US&page=1`
    },
    {
        id: 'topRated',
        title: "Top Rated",
        apiLink: `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=en-US&page=1`
    },
]
const app = document.getElementById('app')
const search = document.getElementById('search')
const imgNotFound = './img-not-found.jpeg'

  
async function apiCall(url) {
    const response = await fetch(url);
    const json = await response.json();
    getMoreQty = json.total_results
    return json
}



async function displayAllShowcases() {
    app.innerHTML =''
    for (showcase of showcases) {
        
        const showcaseEl = createShowcaseElement(showcase)
        app.appendChild(showcaseEl)
        
        const data = await apiCall(showcase.apiLink)
        const movies = data.results

        const showcaseSliderEl = document.createElement('div')
        showcaseSliderEl.classList.add('showcase-slider')

        movies.forEach(movie => {
            showcaseSliderEl.appendChild(createSliderCard(movie))
        });
        showcaseEl.appendChild(showcaseSliderEl)
    }
}

function createShowcaseElement(showcase){
    const showcaseEl = document.createElement('div')
    showcaseEl.classList.add('showcase')
    showcaseEl.innerHTML = `
        <h1 onclick="displayShowcase('${showcase.id}')">${showcase.title} <i class="fas fa-chevron-right"></i></h1>
    `
    return showcaseEl
}

async function displayShowcase(id){
    const showcase = showcases.find(showcase => showcase.id === id);
    const data = await apiCall(showcase.apiLink)
    const movies = data.results
    const showcaseEl = document.createElement('div')
    showcaseEl.classList.add('showcase')
    showcaseEl.setAttribute('id', 'showcase-full')
    showcaseEl.classList.add('showcase-full')
    
    showcaseEl.innerHTML = `<h2>${showcase.title}</h2>`
    
    const showcaseSliderEl = document.createElement('div')
    showcaseSliderEl.classList.add('showcase-slider')
    showcaseSliderEl.classList.add('flex-wrap')

    movies.forEach(movie => {
        showcaseSliderEl.appendChild(createSliderCard(movie))
    });
    showcaseEl.appendChild(showcaseSliderEl)
    app.innerHTML = ''
    app.appendChild(showcaseEl)
    makeLoadMoreButton(1, showcase.apiLink)
    window.scrollTo(0,0)
}

async function loadMore(apiLink){
    const button = document.getElementById('load-more')
    newPage = +button.getAttribute('data-page-number') + 1
    const data = await apiCall(updatePageNumber(apiLink, newPage))
    const movies = data.results
    button.remove()
    const parent = document.querySelector('.showcase-slider')
    addMoviesDom(movies, parent)
    makeLoadMoreButton(newPage, apiLink)
}

function makeLoadMoreButton(pageNum, apiLink){
    if (document.querySelectorAll('.showcase-slide-card').length < getMoreQty){
        const button = document.createElement('button')
        document.getElementById('showcase-full').appendChild(button)
        button.classList.add('load-more')
        button.innerText = "Load More"
        button.setAttribute('id', 'load-more')
        button.setAttribute('data-page-number', pageNum)
        button.setAttribute('onclick', `loadMore("${apiLink}")`)
    }
}

function addMoviesDom(movies, parent){
    movies.forEach(movie => {
        parent.appendChild(createSliderCard(movie))
    });
}

function updatePageNumber(str, num){
    let strArr = str.split('&page=')
    strArr.push(String(num) + strArr[strArr.length-1].slice(1));
    strArr[strArr.length - 2] = '&page='
    return strArr.join('')
}

function createSliderCard(movie) {
    const sliderCard = document.createElement('div')
    sliderCard.classList.add('showcase-slide-card')
    sliderCard.setAttribute('onclick', `displayMovie('${movie.id}')`)
    let posterPath = imgNotFound
    if (movie.poster_path !== null) {
        posterPath = `${secure_base_url}original${movie.poster_path}`
    } 

    sliderCard.innerHTML = `
    <div class='poster'>    
        <img class='poster-img' src='${posterPath}'  onerror="this.onerror=null;this.src='${imgNotFound}'">
            <div class='rating'>
                <i class="fas fa-star"></i>
                <span>${movie.vote_average}<span>
            </div>
    </div>
    <h2>${movie.title}</h2>
    <p>${convertDate(movie.release_date)}</p>
    `

    return sliderCard
}


async function displayMovie(movieID){
    const movie = await apiCall(`https://api.themoviedb.org/3/movie/${movieID}?api_key=${apiKey}&language=en-US`)
    const showcaseContainer = document.createElement('div')
    showcaseContainer.classList.add('movie-showcase-container')
    let genres = ''
    movie.genres.forEach((genre) => genres +=(`<li><small>${genre.name}</small></li>`))
    showcaseContainer.innerHTML = `
            <div class='movie-showcase-poster'>   
                <img class='poster-img' src='${secure_base_url}original${movie.poster_path}'  onerror="this.onerror=null;this.src='${imgNotFound}'">
            </div>
            <div class='movie-showcase-info'>
                <h1>${movie.title}</h1>
                <ul class='info-ul'>
                    <li><small>${getYear(movie.release_date)}</small></li>
                    ${genres}
                    <li><small>${convertTime(movie.runtime)}</small></li>
                </ul>     
                <h3>${movie.tagline}</h3>
                <p>${movie.overview}</p>
            </div>
        `
    app.innerHTML = ''
    app.appendChild(showcaseContainer)
    window.scrollTo(0, 0)
    getCast(movieID)
}


async function getCast(id){
    const data = await apiCall(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=1e562fa9c998c5306da6e7b23bfd7138&language=en-US`)
    console.log(data)
    cast = data.cast

    const showcaseEl = document.createElement('div')
    showcaseEl.classList.add('showcase')
    showcaseEl.innerHTML = `<h2>Top Billed Cast</h2>`

    const showcaseSliderEl = document.createElement('div')
    showcaseSliderEl.classList.add('showcase-slider')
    showcaseEl.appendChild(showcaseSliderEl)
    for (i = 0; i < 10; i++){
        showcaseSliderEl.appendChild(makeCastCard(cast[i]))
    }
    const fullCast = document.createElement('div')
    // fullCast.innerHTML = `<p>See Full Cast and Crew</p>`
    showcaseEl.appendChild(fullCast)
    app.appendChild(showcaseEl)
}

function makeCastCard(castMember){
    const card = document.createElement('div')
    card.classList.add('cast-member')
    card.classList.add('showcase-slide-card')
    card.innerHTML = `
        <div class="poster">
            <img class="poster-img" src='${secure_base_url}w185${castMember.profile_path}'  onerror="this.onerror=null;this.src='${imgNotFound}'">
        </div>
        <h2>${castMember.name}</h2><br> 
        <small>${castMember.character}</small>
    `
    return(card)
}

async function searchMovies(str){
    const data = await apiCall(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${str}&page=1&include_adult=false`)
    displaySearchResults(data.results, data.total_results)
    makeLoadMoreButton(1, `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${str}&page=1&include_adult=false`)
}


function displaySearchResults(results, totalResults){
    app.innerHTML = ''
    const showcaseEl = document.createElement('div')
    showcaseEl.classList.add('showcase')
    showcaseEl.classList.add('showcase-full')
    showcaseEl.setAttribute('id', 'showcase-full')
    showcaseEl.innerHTML = `
        <h2>${totalResults} Results for "${search.value}"</h2>
    `
    const showcaseSliderEl = document.createElement('div')
    showcaseSliderEl.classList.add('showcase-slider')
    showcaseSliderEl.classList.add('search')

    results.forEach(movie => {
          showcaseSliderEl.appendChild(createSliderCard(movie))
        });
    showcaseEl.appendChild(showcaseSliderEl)
    app.appendChild(showcaseEl)
    window.scrollTo(0,0)
}


function convertTime(n) {
    var num = n;
    var hours = (num / 60);
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    return  rhours + "h " + rminutes + "min";
}
function convertDate(date){
    if (date){
    date = date.split('-')
    const year = date[0]
    const month = date[1]
    const day = date[2]
    var months = [ "January", "February", "March", "April", "May", "June", 
           "July", "August", "September", "October", "November", "December" ];
    const monthName = months[month-1];

    return `${monthName} ${day}, ${year}`
    } else {
        return ""
    }
}

function getYear(date){
    if (date){
        date = date.split('-')
        return date[0]
    }
}

function scrollToTop() {

}

(function init() {
    displayAllShowcases()
})()

//Event Listeners
document.getElementById('logo').addEventListener('click', displayAllShowcases)
search.addEventListener('change', (e) => searchMovies(e.target.value))
search.addEventListener('keydown', (e) => {
    if (e.code === 'Enter' || e.keyCode == 13) {
        searchMovies(e.target.value)
    }   
})
document.getElementById('search-btn').addEventListener('click', () => searchMovies(search.value))






