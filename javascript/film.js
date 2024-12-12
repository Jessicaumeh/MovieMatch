// Jessica Umeh x20406212 
// Constants for the API
const API_KEY = "65bc1b66e94d773812c7820b4d9b352e"; 
const API_URL = `https://api.themoviedb.org/3`;

// Variables for DOM elements
let searchForm;
let movieContainer;
let trendingContainer;

// initialize DOM elements
function initialize() {
  searchForm = document.querySelector("#search-form");
  movieContainer = document.querySelector("#movie-container");
  trendingContainer = document.querySelector("#trending-container");

  //add an event listener for the submit event
  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const searchTerm = event.target.elements.search.value;
      trendingContainer.classList.add('hide'); // Hide the trending section
      searchMovies(searchTerm); // Search for the movies with the entered search term
    });
  }
 fetchTrendingMovies();
}

// initialize DOM elements and fetch trending movies
window.onload = function() {
  initialize();
}

// fetch movie details and credits based on ID
async function fetchMovieDetailsAndCredits(id) {
  // Fetch movie details
  const detailedResponse = await fetch(`${API_URL}/movie/${id}?api_key=${API_KEY}`);
  const detailedData = await detailedResponse.json();

  // Fetch movie credits
  const creditsResponse = await fetch(`${API_URL}/movie/${id}/credits?api_key=${API_KEY}`);
  const creditsData = await creditsResponse.json();

  // Return both details and credits
  return { detailedData, creditsData };
}

// fetch trending movies
async function fetchTrendingMovies() {
  const response = await fetch(`${API_URL}/trending/movie/week?api_key=${API_KEY}`);
  const data = await response.json();

  // fetch details and credits for each movie and display them
  if (data.results.length > 0) {
    data.results.forEach(async (movie) => {
      const { detailedData, creditsData } = await fetchMovieDetailsAndCredits(movie.id);
      displayMovies(detailedData, creditsData, trendingContainer);
    });
  } else {
    console.error("No movies found");
  }
}

// search movies based on a search term
async function searchMovies(searchTerm) {
  movieContainer.innerHTML = ""; // Clear any previous search results
  const response = await fetch(`${API_URL}/search/movie?api_key=${API_KEY}&query=${searchTerm}`);
  const data = await response.json();

  // fetch details and credits for each movie and display them
  if (data.results.length > 0) {
    data.results.forEach(async (movie) => {
      const { detailedData, creditsData } = await fetchMovieDetailsAndCredits(movie.id);
      displayMovies(detailedData, creditsData, movieContainer);
    });
  } else {
    console.error("No movies found");
  }
}

// display movies in a container
function displayMovies(movie, credits, container) {
  // Extract the director and main actors from the credits
  const director = credits.crew.find(member => member.job === "Director");
  const actors = credits.cast.slice(0, 3).map(actor => actor.name).join(', ');


// movie details
  const movieDiv = document.createElement("div");
  movieDiv.innerHTML = `
<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" width="200" height="300">
<p>Title: ${movie.title}</p>
<p>Release year: ${movie.release_date.split('-')[0]}</p>
<p>Director: ${director ? director.name : "Unknown"}</p>
<p>Actors: ${actors}</p>
<p>Rating: ${movie.vote_average}</p>
`;
container.appendChild(movieDiv); // Append the new movie div to the container
}

module.exports = {
  initialize,
  fetchTrendingMovies,
  searchMovies,
  displayMovies
}