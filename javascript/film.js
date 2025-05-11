// Jessica Umeh x20406212

// Configuration 
const API_KEY = "65bc1b66e94d773812c7820b4d9b352e";
const API_URL = "https://api.themoviedb.org/3";
const favouriteMovieIds = [550, 14836, 11036, 1233413];

//  Global variables for DOM 
let searchForm, movieContainer, genreSelect, sectionTitle;

// Initialize after page load
window.onload = () => initialize();

// Setup Function 
function initialize() {
  searchForm = document.querySelector("#search-form");
  movieContainer = document.querySelector("#movie-container");
  genreSelect = document.querySelector("#genre-select");
  sectionTitle = document.querySelector("#section-title");

  // Handle search submissions
  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const searchTerm = event.target.elements.search.value.trim();
      const selectedGenre = genreSelect?.value || "";

      if (!searchTerm && !selectedGenre) {
        movieContainer.innerHTML = "<b>Please enter a title or select a genre.</b>";
        return;
      }

      sectionTitle.textContent = searchTerm
        ? `Showing results for "${searchTerm}"`
        : `Showing ${genreSelect.options[genreSelect.selectedIndex].text} Movies`;

      searchMovies(searchTerm, selectedGenre);
    });
  }

  loadGenres(); // Load genres into dropdown

  // Load favourites or trending
  if (document.querySelector("#jessica-container")) {
    fetchFavouriteMovies();
  } else {
    sectionTitle && (sectionTitle.textContent = "Trending Movies");
    fetchTrendingMovies();
  }
}

// Load genres into dropdown 
async function loadGenres() {
  try {
    const res = await fetch(`${API_URL}/genre/movie/list?api_key=${API_KEY}`);
    const data = await res.json();

    if (genreSelect && data.genres) {
      data.genres.forEach((genre) => {
        const option = document.createElement("option");
        option.value = genre.id;
        option.textContent = genre.name;
        genreSelect.appendChild(option);
      });
    }
  } catch (err) {
    console.error("Error loading genres:", err);
  }
}

//  Search for movies 
async function searchMovies(searchTerm, genreId = "") {
  movieContainer.innerHTML = "<b>Loading...</b>";

  const url = searchTerm
    ? `${API_URL}/search/movie?api_key=${API_KEY}&query=${searchTerm}`
    : `${API_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    let results = data.results || [];

    // Manual filter if both search + genre
    if (searchTerm && genreId) {
      results = results.filter(movie =>
        movie.genre_ids.includes(parseInt(genreId))
      );
    }

    if (results.length === 0) {
      movieContainer.innerHTML = "<b>No movies found.</b>";
      return;
    }

    movieContainer.innerHTML = "";
    for (const movie of results) {
      const { detailedData, creditsData } = await fetchMovieDetailsAndCredits(movie.id);
      displayMovieCard(detailedData, creditsData, movieContainer);
    }
  } catch (err) {
    movieContainer.innerHTML = "<p>Error fetching movies.</p>";
    console.error(err);
  }
}

//  Fetch trending movies 
async function fetchTrendingMovies() {
  movieContainer.innerHTML = "<b>Loading trending movies...</b>";

  try {
    const res = await fetch(`${API_URL}/trending/movie/week?api_key=${API_KEY}`);
    const data = await res.json();

    if (!data.results?.length) {
      movieContainer.innerHTML = "<b>No trending movies found.</b>";
      return;
    }

    movieContainer.innerHTML = "";
    for (const movie of data.results) {
      const { detailedData, creditsData } = await fetchMovieDetailsAndCredits(movie.id);
      displayMovieCard(detailedData, creditsData, movieContainer);
    }
  } catch (err) {
    movieContainer.innerHTML = "<p>Error loading movies.</p>";
    console.error(err);
  }
}

//  Fetch a movie's details and credits 
async function fetchMovieDetailsAndCredits(id) {
  const details = await fetch(`${API_URL}/movie/${id}?api_key=${API_KEY}`).then(res => res.json());
  const credits = await fetch(`${API_URL}/movie/${id}/credits?api_key=${API_KEY}`).then(res => res.json());
  return { detailedData: details, creditsData: credits };
}

// Display a movie card 
function displayMovieCard(movie, credits, container) {
  const director = credits.crew.find(member => member.job === "Director");
  const actors = credits.cast.slice(0, 3).map(actor => actor.name).join(', ');
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/200x300?text=No+Image";

  const movieDiv = document.createElement("div");
  movieDiv.className = "col-md-4 mb-4";
  movieDiv.innerHTML = `
    <a href="MovieDetails.html?id=${movie.id}" class="text-decoration-none text-dark">
      <div class="card h-100 shadow-sm">
        <img src="${posterUrl}" class="card-img-top" alt="${movie.title}" style="height: 400px; object-fit: cover;">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${movie.title}</h5>
          <p class="card-text"><strong>Director:</strong> ${director?.name || "Unknown"}</p>
          <p class="card-text"><strong>Actors:</strong> ${actors}</p>
          <p class="card-text mt-auto"><strong>Rating:</strong> ⭐ ${movie.vote_average}</p>
        </div>
      </div>
    </a>
  `;
  container.appendChild(movieDiv);
}

//  Load Jessica's Favourite Movies 
async function fetchFavouriteMovies() {
  const jessicaContainer = document.querySelector("#jessica-container");
  if (!jessicaContainer) return;

  for (const id of favouriteMovieIds) {
    const { detailedData, creditsData } = await fetchMovieDetailsAndCredits(id);
    displayMovieCard(detailedData, creditsData, jessicaContainer);
  }
}
