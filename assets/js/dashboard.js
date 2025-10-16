// ========================================
// VARIABLES GLOBALES
// ========================================

// Array que almacena TODAS las películas cargadas desde el JSON (nunca cambia)
let peliculasData = [];

// Array que almacena las películas que SE MUESTRAN en pantalla (cambia según filtros/búsqueda)
let peliculasFiltradas = [];

// Variable que guarda la categoría activa actual ('all', 'Acción', 'Romance' o 'Terror')
let categoriaActual = 'all';

// ========================================
// ELEMENTOS DEL DOM
// ========================================

// Variables que guardarán referencias a los elementos HTML
let moviesGrid;      // Contenedor donde se muestran las tarjetas de películas
let searchInput;     // Input de búsqueda
let searchBtn;       // Botón de la lupa
let categoryBtns;    // Botones de categoría (Acción, Romance, Terror)
let menuBtn;         // Botón del menú hamburguesa

// ========================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ========================================

// Este evento espera a que TODO el HTML esté cargado antes de ejecutarse
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Cargado - Inicializando dashboard');
    
    // PASO 1: Obtener referencias a todos los elementos HTML
    moviesGrid = document.getElementById('moviesGrid');
    searchInput = document.getElementById('searchInput');
    searchBtn = document.getElementById('searchBtn');
    categoryBtns = document.querySelectorAll('.category-btn'); // Selecciona TODOS los botones con esta clase
    menuBtn = document.getElementById('menuBtn');
    
    // Log para verificar que todos los elementos fueron encontrados
    console.log('Elementos encontrados:', {
        moviesGrid: !!moviesGrid,      // !! convierte a boolean (true si existe)
        searchInput: !!searchInput,
        searchBtn: !!searchBtn,
        categoryBtns: categoryBtns.length, // Cuántos botones se encontraron
        menuBtn: !!menuBtn
    });
    
    // PASO 2: Cargar las películas desde el JSON
    cargarPeliculas();
    
    // PASO 3: Conectar todos los eventos (clicks, inputs, etc.)
    inicializarEventos();
});

// ========================================
// CARGAR PELÍCULAS DESDE JSON
// ========================================

// Función asíncrona que trae las películas del archivo JSON
async function cargarPeliculas() {
    try {
        console.log('Cargando películas desde JSON...');
        
        // fetch() hace una petición al archivo JSON
        const response = await fetch('assets/data/peliculas.json');
        
        // Verificar si la petición fue exitosa
        if (!response.ok) throw new Error('Error al cargar películas');

        // Convertir la respuesta de texto JSON a un array de objetos JavaScript
        peliculasData = await response.json();
        
        // Hacer una COPIA de todas las películas para mostrarlas inicialmente
        // El [...array] crea una copia (spread operator)
        peliculasFiltradas = [...peliculasData];
        
        console.log('Películas cargadas:', peliculasData.length);
        
        // Mostrar todas las películas en pantalla
        renderizarPeliculas(peliculasFiltradas);
        
    } catch (error) {
        // Si algo sale mal (archivo no existe, JSON mal formado, etc.)
        console.error('Error al cargar películas:', error);
        mostrarError();
    }
}

// ========================================
// RENDERIZAR PELÍCULAS EN PANTALLA
// ========================================

// Función que toma un array de películas y las muestra en el grid
function renderizarPeliculas(peliculas) {
    
    // PASO 1: Limpiar todo el contenido anterior del grid
    moviesGrid.innerHTML = '';

    // PASO 2: Si no hay películas para mostrar, mostrar mensaje
    if (peliculas.length === 0) {
        moviesGrid.innerHTML = `
        <div class="empty-state">
            <p>No se encontraron películas</p>
            <small>Intenta con otra búsqueda o categoría</small>
        </div>
        `;
        return; // Salir de la función
    }

    // PASO 3: Por cada película, crear su tarjeta y agregarla al grid
    peliculas.forEach(pelicula => {
        // Crear la tarjeta HTML
        const movieCard = crearTarjetaPelicula(pelicula);
        
        // Agregar la tarjeta al contenedor
        moviesGrid.appendChild(movieCard);
    });
}

// ========================================
// CREAR TARJETA DE PELÍCULA
// ========================================

// Función que crea el HTML de una tarjeta de película individual
function crearTarjetaPelicula(pelicula) {
    
    // Crear un elemento <article> (etiqueta semántica HTML5)
    const card = document.createElement('article');
    
    // Agregar la clase CSS para estilos
    card.className = 'movie-card';
    
    // Guardar el ID de la película como atributo de datos (útil para modal)
    card.dataset.movieId = pelicula.id;

    // Insertar el HTML interno de la tarjeta usando template strings
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
    // Nota: onerror carga una imagen por defecto si la carátula no existe

    // Agregar evento click a la tarjeta para abrir el modal
    card.addEventListener('click', () => {
        abrirModalPelicula(pelicula);
    });

    // Devolver la tarjeta completa
    return card;
}

// ========================================
// FUNCIÓN PLACEHOLDER PARA MODAL
// ========================================

// Esta función será implementada por tu compañero
// Por ahora solo imprime en consola y dispara un evento
function abrirModalPelicula(pelicula) {
    console.log('Abrir modal para:', pelicula);
    
    // Disparar un evento personalizado que tu compañero puede escuchar
    // desde su archivo del modal
    document.dispatchEvent(new CustomEvent('abrirModal', {
        detail: pelicula // Los datos de la película se pasan aquí
    }));
}

// ========================================
// BÚSQUEDA DE PELÍCULAS
// ========================================

// Función que filtra películas según el texto escrito en el input
function buscarPeliculas() {
    
    // Obtener el texto del input, convertirlo a minúsculas y quitar espacios
    const termino = searchInput.value.toLowerCase().trim();

    // PASO 1: Primero filtrar por la categoría activa
    let peliculasBase;
    
    if (categoriaActual === 'all') {
        // Si no hay filtro de categoría, usar todas las películas
        peliculasBase = [...peliculasData];
    } else {
        // Si hay filtro activo, usar solo películas de esa categoría
        peliculasBase = peliculasData.filter(p => p.categoria === categoriaActual);
    }

    // PASO 2: Aplicar filtro de búsqueda por nombre
    if (termino === '') {
        // Si no hay texto de búsqueda, mostrar todas las de la categoría
        peliculasFiltradas = peliculasBase;
    } else {
        // Si hay texto, filtrar las que incluyan ese texto en el nombre
        // .includes() busca coincidencias parciales (ej: "miss" encuentra "Mission")
        peliculasFiltradas = peliculasBase.filter(pelicula =>
            pelicula.nombre.toLowerCase().includes(termino)
        );
    }

    // PASO 3: Actualizar la visualización con las películas filtradas
    renderizarPeliculas(peliculasFiltradas);
}

// ========================================
// FILTRADO POR CATEGORÍA (CON TOGGLE)
// ========================================

// Función que filtra películas por categoría y maneja el comportamiento de toggle
function filtrarPorCategoria(botonClickeado) {
    
    // Logs para debugging (verificar que funciona)
    console.log('=== CLICK EN BOTÓN ===');
    console.log('Botón clickeado:', botonClickeado);
    console.log('Categoría:', botonClickeado.dataset.category);
    console.log('Tiene clase active ANTES:', botonClickeado.classList.contains('active'));
    
    // Obtener la categoría del botón (guardada en data-category)
    const categoria = botonClickeado.dataset.category;
    
    // Obtener el texto actual del buscador (por si hay búsqueda activa)
    const termino = searchInput.value.toLowerCase().trim();
    
    // Verificar si el botón YA está activo
    const estaActivo = botonClickeado.classList.contains('active');
    
    // CASO 1: Si el botón YA estaba activo → DESACTIVARLO (toggle off)
    if (estaActivo) {
        console.log('→ DESACTIVANDO - Mostrando todas las películas');
        
        // Quitar la clase 'active' del botón (se pone gris)
        botonClickeado.classList.remove('active');
        
        // Cambiar categoría actual a 'all' (sin filtro)
        categoriaActual = 'all';
        
        // Copiar TODAS las películas para mostrarlas
        peliculasFiltradas = [...peliculasData];
    } 
    // CASO 2: Si el botón NO estaba activo → ACTIVARLO (toggle on)
    else {
        console.log('→ ACTIVANDO filtro:', categoria);
        
        // Primero, desactivar TODOS los botones de categoría
        categoryBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Activar SOLO el botón que se clickeó
        botonClickeado.classList.add('active');
        
        // Actualizar la categoría actual
        categoriaActual = categoria;
        
        // Filtrar las películas por la categoría seleccionada
        // .filter() crea un nuevo array solo con las que cumplen la condición
        peliculasFiltradas = peliculasData.filter(p => p.categoria === categoria);
    }
    
    console.log('Tiene clase active DESPUÉS:', botonClickeado.classList.contains('active'));
    
    // Si hay texto en el buscador, aplicar TAMBIÉN ese filtro
    if (termino !== '') {
        peliculasFiltradas = peliculasFiltradas.filter(pelicula =>
            pelicula.nombre.toLowerCase().includes(termino)
        );
    }
    
    // Logs para verificar resultados
    console.log('Total películas:', peliculasData.length);
    console.log('Películas filtradas:', peliculasFiltradas.length);
    console.log('Categoría actual:', categoriaActual);
    console.log('========================\n');
    
    // Actualizar la visualización con las películas filtradas
    renderizarPeliculas(peliculasFiltradas);
}

// ========================================
// INICIALIZAR TODOS LOS EVENTOS
// ========================================

// Función que conecta todos los eventos (clicks, inputs, etc.) a sus funciones
function inicializarEventos() {
    console.log('Inicializando eventos...');
    
    // ========== BÚSQUEDA ==========
    
    // Evento: Click en el botón de búsqueda (lupa)
    if (searchBtn) {
        searchBtn.addEventListener('click', buscarPeliculas);
        console.log('✓ Evento búsqueda con botón vinculado');
    }
    
    // Evento: Escribir en el input de búsqueda (búsqueda en tiempo real)
    if (searchInput) {
        searchInput.addEventListener('input', buscarPeliculas);
        console.log('Evento búsqueda en tiempo real vinculado');
        
        // Evento: Presionar Enter en el input
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                buscarPeliculas();
            }
        });
    }
    
    // ========== BOTONES DE CATEGORÍA ==========
    
    if (categoryBtns && categoryBtns.length > 0) {
        console.log('Vinculando eventos a', categoryBtns.length, 'botones de categoría');
        
        // Por cada botón de categoría, agregar evento click
        categoryBtns.forEach((btn, index) => {
            console.log(`Botón ${index}:`, btn.dataset.category);
            
            // Agregar listener con function() para poder usar 'this'
            // 'this' dentro de la función se refiere al botón que fue clickeado
            btn.addEventListener('click', function(e) {
                console.log('Click detectado en botón:', this.dataset.category);
                filtrarPorCategoria(this); // Pasar el botón clickeado
            });
        });
        console.log('✓ Eventos de categorías vinculados');
    } else {
        console.error(' No se encontraron botones de categoría');
    }
    
    // ========== BOTÓN DE MENÚ ==========
    
    // Evento: Click en el menú hamburguesa
    // Tu compañero implementará la funcionalidad del menú lateral
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            console.log('Abrir menú lateral');
            
            // Disparar evento personalizado para que tu compañero lo escuche
            document.dispatchEvent(new CustomEvent('toggleMenu'));
        });
        console.log('✓ Evento menú vinculado');
    }
    
    console.log('Inicialización de eventos completada');
}

// ========================================
// MOSTRAR MENSAJE DE ERROR
// ========================================

// Función que muestra un mensaje si no se pueden cargar las películas
function mostrarError() {
    moviesGrid.innerHTML = `
    <div class="empty-state">
        <p>Error al cargar películas</p>
        <small>Por favor, verifica que el archivo JSON esté en la ruta correcta</small>
    </div>
    `;
}

// ========================================
// FUNCIÓN DE UTILIDAD: LIMPIAR BÚSQUEDA
// ========================================

// Función que limpia el input de búsqueda y muestra todas las películas
function limpiarBusqueda() {
    searchInput.value = '';
    buscarPeliculas();
}




// SIDEBAR FUNCTIONALITY
document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.getElementById('menuBtn');
    const sideBar = document.getElementById('side-Bar');
    const dashboard = document.getElementById('dashboard');
    

    
    // Función para abrir/cerrar sidebar
    function toggleSidebar() {
        sideBar.classList.toggle('active');
        overlay.classList.toggle('active');
        dashboard.classList.toggle('sidebar-open');
    }
    
    // Event listeners
    menuBtn.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);
    

    
});