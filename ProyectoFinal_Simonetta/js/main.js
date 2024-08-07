const apiKey = "e9f041a565fe9432d6d17b0374e54847";
const baseUrl = "https://api.themoviedb.org/3";
const galeria = document.getElementById('galeria');
const tituloPag = document.getElementById('tituloPag');
const form = document.getElementById('form');
const searchInput = document.getElementById('search');
const descripcionPelicula = document.getElementById('descripcion-pelicula');
const categoryAction = document.getElementById('categoryAccion');
const categoryComedy = document.getElementById('categoryComedia');
const categoryTerror = document.getElementById('categoryTerror');

const totalPages = 15;
let favoritesList = JSON.parse(localStorage.getItem('favorites')) || [];

async function fetchMoviesByPage(page) {
    const response = await fetch(`${baseUrl}/movie/popular?include_adult=false&api_key=${apiKey}&page=${page}&language=es-AR`);
    const data = await response.json();
    return data;
}

function fetchAllMovies() {
    const promises = [];
    for (let page = 1; page <= totalPages; page++) {
        promises.push(fetchMoviesByPage(page));
    }

    return Promise.all(promises)
        .then(pages => {
            const allMovies = pages.reduce((accumulator, currentPage) => {
                const filteredMovies = currentPage.results.filter(movie => !movie.adult);
                return accumulator.concat(filteredMovies);
            }, []);
            return allMovies;
        });
}

function createMovieCards(movies) {
    movies.forEach(movie => {
        if (movie.backdrop_path) {
            const cardContainer = document.createElement('div');
            cardContainer.classList.add('movie-card');

            const cardImage = document.createElement('img');
            cardImage.src = `https://image.tmdb.org/t/p/w300/${movie.backdrop_path}`;
            cardImage.alt = `${movie.title}`;

            const cardDescription = document.createElement('div');
            cardDescription.classList.add('descripcion-card');

            const cardTitle = document.createElement('h2');
            cardTitle.classList.add('titulo-card');
            cardTitle.textContent = movie.title;

            const cardButton = document.createElement('button');
            cardButton.setAttribute('id', 'btn-verMas');
            cardButton.classList.add('btn-12');
            cardButton.innerHTML = '<span>Ver Mas</span>';

            const favoriteButton = document.createElement('button');
            favoriteButton.classList.add('btnFav');
            favoriteButton.setAttribute('id', `btnFav-${movie.id}`);
            favoriteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" /></svg>`;

            favoriteButton.addEventListener('click', () => {
                addToFavorites(movie, favoriteButton);
            });

            cardButton.addEventListener('click', () => {
                galeria.innerHTML = '';
                displayMovieDescription(movie);
            });

            cardDescription.appendChild(cardTitle);
            cardDescription.appendChild(cardButton);
            cardDescription.appendChild(favoriteButton);

            cardContainer.appendChild(cardImage);
            cardContainer.appendChild(cardDescription);

            galeria.appendChild(cardContainer);
        }
    });
}

function addToFavorites(movie, favoriteButton) {
    const isFavorite = favoritesList.some(favoriteMovie => favoriteMovie.id === movie.id);

    if (isFavorite) {
        Swal.fire({
            title: 'Ya está en tus Favoritos',
            text: "¿Querés borrar esta película?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, quiero borrarla!'
        }).then((result) => {
            if (result.isConfirmed) {
                favoritesList = favoritesList.filter(favoriteMovie => favoriteMovie.id !== movie.id);
                localStorage.setItem('favorites', JSON.stringify(favoritesList));
                Swal.fire('¡Borrada!', 'Has borrado este título.', 'success');
                favoriteButton.style.backgroundColor = '';
            }
        });
    } else {
        favoritesList.push(movie);
        localStorage.setItem('favorites', JSON.stringify(favoritesList));
        Swal.fire({ title: 'Agregaste la película a Favoritos' });
        favoriteButton.style.backgroundColor = 'gold';
    }
}

document.getElementById('mostrarFavoritos').addEventListener('click', function () {
    galeria.innerHTML = '';
    tituloPag.innerHTML = 'Favoritos';
    favoritesList.forEach(movie => {
        const cardContainer = document.createElement('div');
        cardContainer.classList.add('movie-card');

        const cardImage = document.createElement('img');
        cardImage.src = `https://image.tmdb.org/t/p/original/${movie.backdrop_path}`;
        cardImage.alt = `${movie.title}`;
        cardImage.classList.add('descripcion-img');

        const cardDescription = document.createElement('div');
        cardDescription.classList.add('descripcion-card');

        const cardTitle = document.createElement('h2');
        cardTitle.classList.add('titulo-card');
        cardTitle.textContent = movie.title;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Borrar de favoritos';
        deleteButton.classList.add('btnBorrar');

        deleteButton.addEventListener('click', () => {
            deleteFromFavorites(movie);
            document.getElementById('mostrarFavoritos').click();
        });

        cardDescription.appendChild(cardTitle);
        cardDescription.appendChild(deleteButton);

        cardContainer.appendChild(cardImage);
        cardContainer.appendChild(cardDescription);

        galeria.appendChild(cardContainer);
    });
});

function deleteFromFavorites(movie) {
    const index = favoritesList.findIndex(favoriteMovie => favoriteMovie.id === movie.id);
    if (index !== -1) {
        favoritesList.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favoritesList));
    }
}

function isFavorite(movie) {
    return favoritesList.some(favoriteMovie => favoriteMovie.id === movie.id);
}

fetchAllMovies()
    .then(allMovies => {
        createMovieCards(allMovies);
    })
    .catch(error => {
        console.error('Error al obtener películas:', error);
        Swal.fire('Error', 'No se pudieron obtener las películas.', 'error');
    });

form.addEventListener('submit', function (event) {
    event.preventDefault();
    const searchTerm = searchInput.value.trim();
    if (searchTerm !== '') {
        searchMovies(searchTerm);
        searchInput.value = '';
    }
});

function searchMovies(searchTerm) {
    const searchUrl = `${baseUrl}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(searchTerm)}&language=es-AR`;

    fetch(searchUrl)
        .then(response => response.json())
        .then(data => {
            
            const logoImg = document.createElement('img');
            logoImg.src = './img/Simonetta_CMF_logocompleto.png'; 
            logoImg.alt = 'CODER MOVIE FESTIVAL';
            logoImg.style.maxWidth = '80%'; 
            
            tituloPag.innerHTML = '';
            tituloPag.appendChild(logoImg);

            displaySearchResults(data.results.length > 0 ? data.results : []);
        })
        .catch(error => {
            console.error('Error al buscar películas:', error);
            Swal.fire('Error', 'No se pudieron buscar las películas.', 'error');
        });
}

function displaySearchResults(results) {
    galeria.innerHTML = '';
    createMovieCards(results);
}

function displayMovieDescription(movie) {
    const descripcionImagen = document.createElement('IMG');
    descripcionImagen.src = `https://image.tmdb.org/t/p/original/${movie.backdrop_path}`;
    descripcionImagen.classList.add('descripcion-img');
    descripcionImagen.alt = movie.title;

    const descripcionTitulo = document.createElement('H3');
    descripcionTitulo.textContent = `${movie.title}`;
    descripcionTitulo.classList.add('descripcionTitulo');

    const descripcionParrafo = document.createElement('P');
    descripcionParrafo.innerHTML = movie.overview;
    descripcionParrafo.classList.add('descripcionParrafo');

    const btnVolver = document.createElement('A');
    btnVolver.textContent = 'Volver';
    btnVolver.href = '#';
    btnVolver.classList.add('btnVolver');
    btnVolver.setAttribute('id', 'btnVolver');

    descripcionPelicula.innerHTML = '';
    descripcionPelicula.appendChild(descripcionImagen);
    descripcionPelicula.appendChild(descripcionTitulo);
    descripcionPelicula.appendChild(descripcionParrafo);
    descripcionPelicula.appendChild(btnVolver);

    galeria.style.display = 'none';
    btnVolver.addEventListener('click', (event) => {
        event.preventDefault();
        descripcionPelicula.innerHTML = '';
        galeria.style.display = 'grid';

        fetchAllMovies()
            .then(allMovies => {
                createMovieCards(allMovies);
            })
            .catch(error => {
                console.error('Error al obtener películas:', error);
                Swal.fire('Error', 'No se pudieron obtener las películas.', 'error');
            });
    });
}

categoryAction.addEventListener('click', () => {
    fetch(`${baseUrl}/genre/movie/list?api_key=${apiKey}&language=es-AR`)
        .then(response => response.json())
        .then(data => {
            const actionGenre = data.genres.find(genre => genre.name === 'Acción');
            const actionGenreId = actionGenre.id;
            fetch(`${baseUrl}/discover/movie?api_key=${apiKey}&language=es-AR&with_genres=${actionGenreId}`)
                .then(response => response.json())
                .then(data => {
                    const actionMovies = data.results;
                    galeria.innerHTML = '';
                    tituloPag.innerHTML = 'Acción';
                    createMovieCards(actionMovies);
                })
                .catch(error => {
                    console.error('Error al obtener películas de acción:', error);
                    Swal.fire('Error', 'No se pudieron obtener las películas de acción.', 'error');
                });
        })
        .catch(error => {
            console.error('Error al obtener géneros:', error);
            Swal.fire('Error', 'No se pudieron obtener los géneros.', 'error');
        });
});

categoryComedy.addEventListener('click', () => {
    fetch(`${baseUrl}/genre/movie/list?api_key=${apiKey}&language=es-AR`)
        .then(response => response.json())
        .then(data => {
            const comedyGenre = data.genres.find(genre => genre.name === 'Comedia');
            const comedyGenreId = comedyGenre.id;
            fetch(`${baseUrl}/discover/movie?api_key=${apiKey}&language=es-AR&with_genres=${comedyGenreId}`)
                .then(response => response.json())
                .then(data => {
                    const comedyMovies = data.results;
                    galeria.innerHTML = '';
                    tituloPag.innerHTML = 'Comedia';
                    createMovieCards(comedyMovies);
                })
                .catch(error => {
                    console.error('Error al obtener películas de comedia:', error);
                    Swal.fire('Error', 'No se pudieron obtener las películas de comedia.', 'error');
                });
        })
        .catch(error => {
            console.error('Error al obtener géneros:', error);
            Swal.fire('Error', 'No se pudieron obtener los géneros.', 'error');
        });
});

/*Simonetta, Daniel: https://github.com/SIVAnode*/

categoryTerror.addEventListener('click', () => {
    fetch(`${baseUrl}/genre/movie/list?api_key=${apiKey}&language=es-AR`)
        .then(response => response.json())
        .then(data => {
            const terrorGenre = data.genres.find(genre => genre.name === 'Terror');
            const terrorGenreId = terrorGenre.id;
            fetch(`${baseUrl}/discover/movie?api_key=${apiKey}&language=es-AR&with_genres=${terrorGenreId}`)
                .then(response => response.json())
                .then(data => {
                    const terrorMovies = data.results;
                    galeria.innerHTML = '';
                    tituloPag.innerHTML = 'Terror';
                    createMovieCards(terrorMovies);
                })
                .catch(error => {
                    console.error('Error al obtener películas de terror:', error);
                    Swal.fire('Error', 'No se pudieron obtener las películas de terror.', 'error');
                });
        })
        .catch(error => {
            console.error('Error al obtener géneros:', error);
            Swal.fire('Error', 'No se pudieron obtener los géneros.', 'error');
        });
});

document.addEventListener('DOMContentLoaded', () => {
    const aboutUsButton = document.getElementById('aboutUs');

    aboutUsButton.addEventListener('click', (event) => {
        event.preventDefault(); 
        Swal.fire({
            title: 'About Us',
            text: 'Simonetta, Daniel\n (Comisión 57725)',
            icon: 'info',
            confirmButtonText: 'OK'
        });
    });
});
