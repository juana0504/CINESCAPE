// ========== VARIABLES GLOBALES ==========
let peliculasData = [];
let peliculasFiltradas = [];
let categoriaActual = 'all';

// ========== ELEMENTOS DEL DOM ==========
const moviesGrid = document.getElementById('moviesGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoryBtns = document.querySelectorAll('.category-btn');
const menuBtn = document.getElementById('menuBtn');

// ========== CARGAR PELÍCULAS AL INICIAR ==========
document.addEventListener('DOMContentLoaded', () => {
    cargarPeliculas();
    inicializarEventos();
});

// ========== FUNCIÓN PARA CARGAR JSON ==========
async function cargarPeliculas() {
    try {
        const response = await fetch('assets/data/peliculas.json');
        if (!response.ok) throw new Error('Error al cargar películas');

        peliculasData = await response.json();
        peliculasFiltradas = [...peliculasData];
        renderizarPeliculas(peliculasFiltradas);
    } catch (error) {
        console.error('Error:', error);
        mostrarError();
    }
}

// ========== RENDERIZAR PELÍCULAS EN EL GRID ==========
function renderizarPeliculas(peliculas) {
    moviesGrid.innerHTML = '';

    if (peliculas.length === 0) {
        moviesGrid.innerHTML = `
        <div class="empty-state">
            <p>No se encontraron películas</p>
            <small>Intenta con otra búsqueda o categoría</small>
        </div>
        `;
        return;
    }

    peliculas.forEach(pelicula => {
        const movieCard = crearTarjetaPelicula(pelicula);
        moviesGrid.appendChild(movieCard);
    });
}

// ========== CREAR TARJETA DE PELÍCULA ==========
function crearTarjetaPelicula(pelicula) {
    const card = document.createElement('article');
    card.className = 'movie-card';
    card.dataset.movieId = pelicula.id;

    card.innerHTML = `
        <img src="assets/${pelicula.ruta_caratula}" 
            alt="${pelicula.nombre}" 
            class="movie-poster"
            onerror="this.src='assets/img/placeholder.jpg'">
        <div class="movie-info">
        <h3 class="movie-title">${pelicula.nombre}</h3>
        <span class="movie-year">${pelicula.anio}</span>
        </div>
    `;

    // Evento click para que tu compañero pueda conectar el modal
    card.addEventListener('click', () => {
        abrirModalPelicula(pelicula);
    });

    return card;
}

// ========== FUNCIÓN PLACEHOLDER PARA MODAL (tu compañero la implementará) ==========
function abrirModalPelicula(pelicula) {
    console.log('Abrir modal para:', pelicula);
    // Aquí tu compañero conectará la funcionalidad del modal
    // Por ahora solo imprime en consola

    // Ejemplo de evento personalizado que puede escuchar tu compañero:
    document.dispatchEvent(new CustomEvent('abrirModal', {
        detail: pelicula
    }));
}

// ========== BÚSQUEDA DE PELÍCULAS ==========
function buscarPeliculas() {
    const termino = searchInput.value.toLowerCase().trim();

    // Primero filtra por categoría
    let peliculasBase = categoriaActual === 'all'
        ? peliculasData
        : peliculasData.filter(p => p.categoria === categoriaActual);

    // Luego aplica búsqueda por nombre
    if (termino === '') {
        peliculasFiltradas = peliculasBase;
    } else {
        peliculasFiltradas = peliculasBase.filter(pelicula =>
            pelicula.nombre.toLowerCase().includes(termino)
        );
    }

    renderizarPeliculas(peliculasFiltradas);
}

// ========== FILTRADO POR CATEGORÍA ==========
function filtrarPorCategoria(categoria) {
    categoriaActual = categoria;
    const termino = searchInput.value.toLowerCase().trim();

    // Filtrar por categoría
    if (categoria === 'all') {
        peliculasFiltradas = [...peliculasData];
    } else {
        peliculasFiltradas = peliculasData.filter(p => p.categoria === categoria);
    }

    // Si hay búsqueda activa, aplicarla también
    if (termino !== '') {
        peliculasFiltradas = peliculasFiltradas.filter(pelicula =>
            pelicula.nombre.toLowerCase().includes(termino)
        );
    }

    renderizarPeliculas(peliculasFiltradas);

    // Actualizar botones activos
    categoryBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === categoria) {
            btn.classList.add('active');
        }
    });
}

// ========== INICIALIZAR EVENTOS ==========
function inicializarEventos() {
    // Búsqueda con botón
    searchBtn.addEventListener('click', buscarPeliculas);

    // Búsqueda en tiempo real
    searchInput.addEventListener('input', buscarPeliculas);

    // Búsqueda con Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            buscarPeliculas();
        }
    });

    // Botones de categoría
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filtrarPorCategoria(btn.dataset.category);
        });
    });

    // Botón de menú (placeholder para tu compañero)
    menuBtn.addEventListener('click', () => {
        console.log('Abrir menú lateral');
        // Aquí tu compañero conectará el menú lateral
        document.dispatchEvent(new CustomEvent('toggleMenu'));
    });
}

// ========== MOSTRAR ERROR ==========
function mostrarError() {
    moviesGrid.innerHTML = `
    <div class="empty-state">
        <p>⚠️ Error al cargar películas</p>
        <small>Por favor, verifica que el archivo JSON esté en la ruta correcta</small>
    </div>
    `;
}

// ========== FUNCIÓN DE UTILIDAD: LIMPIAR BÚSQUEDA ==========
function limpiarBusqueda() {
    searchInput.value = '';
    buscarPeliculas();
}

// Exportar funciones para que otros compañeros puedan usarlas si necesitan
window.dashboardAPI = {
    obtenerPeliculaPorId: (id) => peliculasData.find(p => p.id === id),
    obtenerTodasLasPeliculas: () => peliculasData,
    limpiarBusqueda: limpiarBusqueda
};