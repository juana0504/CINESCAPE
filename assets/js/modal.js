// ========================================
// ELEMENTOS DEL DOM
// ========================================

let modalOverlay;
let modalContainer;
let modalCloseBtn;
let modalPoster;
let modalTitle;
let modalCategory;
let modalYear;
let modalSinopsis;
let modalReparto;
let modalWatchBtn;

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Modal JS inicializado');
    
    // Obtener referencias a todos los elementos del modal
    modalOverlay = document.getElementById('modalOverlay');
    modalContainer = document.getElementById('modalContainer');
    modalCloseBtn = document.getElementById('modalCloseBtn');
    modalPoster = document.getElementById('modalPoster');
    modalTitle = document.getElementById('modalTitle');
    modalCategory = document.getElementById('modalCategory');
    modalYear = document.getElementById('modalYear');
    modalSinopsis = document.getElementById('modalSinopsis');
    modalReparto = document.getElementById('modalReparto');
    modalWatchBtn = document.getElementById('modalWatchBtn');
    
    // Verificar que todos los elementos existen
    console.log('Elementos del modal encontrados:', {
        overlay: !!modalOverlay,
        container: !!modalContainer,
        closeBtn: !!modalCloseBtn
    });
    
    // Inicializar eventos
    inicializarEventosModal();
});

// ========================================
// ESCUCHAR EVENTO PERSONALIZADO
// ========================================

// Este evento es disparado desde dashboard.js cuando se hace clic en una película
document.addEventListener('abrirModal', (event) => {
    console.log('Evento abrirModal recibido:', event.detail);
    const pelicula = event.detail;
    mostrarModal(pelicula);
});

// ========================================
// MOSTRAR MODAL
// ========================================

function mostrarModal(pelicula) {
    console.log('Mostrando modal para:', pelicula.nombre);
    
    // Llenar el contenido del modal con los datos de la película
    modalPoster.src = `assets/${pelicula.ruta_caratula}`;
    modalPoster.alt = pelicula.nombre;
    modalTitle.textContent = pelicula.nombre;
    modalCategory.textContent = pelicula.categoria;
    modalYear.textContent = pelicula.anio;
    modalSinopsis.textContent = pelicula.sinopsis;
    modalReparto.textContent = pelicula.reparto.join(', ');
    
    // Mostrar el modal con animación
    // Primero hacemos visible el overlay
    modalOverlay.style.display = 'flex';
    
    // Pequeño delay para que la animación CSS funcione correctamente
    setTimeout(() => {
        modalOverlay.classList.add('active');
    }, 10);
    
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
}

// ========================================
// CERRAR MODAL
// ========================================

function cerrarModal() {
    console.log('Cerrando modal');
    
    // Quitar la clase active (esto activa la animación de salida)
    modalOverlay.classList.remove('active');
    
    // Esperar a que termine la animación antes de ocultar completamente
    setTimeout(() => {
        modalOverlay.style.display = 'none';
        
        // Restaurar scroll del body
        document.body.style.overflow = 'auto';
    }, 400); // 400ms coincide con la duración de la transición en CSS
}

// ========================================
// INICIALIZAR EVENTOS DEL MODAL
// ========================================

function inicializarEventosModal() {
    
    // Evento: Click en el botón de cerrar (X)
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que el click se propague
            cerrarModal();
        });
        console.log('✓ Evento botón cerrar vinculado');
    }
    
    // Evento: Click en el overlay (fondo oscuro) para cerrar
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            // Solo cerrar si se hace click directamente en el overlay
            // (no en el contenido del modal)
            if (e.target === modalOverlay) {
                cerrarModal();
            }
        });
        console.log('✓ Evento overlay vinculado');
    }
    
    // Evento: Presionar tecla ESC para cerrar
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            cerrarModal();
        }
    });
    console.log('✓ Evento ESC vinculado');
    
    // Evento: Click en el botón "VER PELÍCULA"
    if (modalWatchBtn) {
        modalWatchBtn.addEventListener('click', () => {
            console.log('Reproducir película:', modalTitle.textContent);
            // Aquí puedes agregar la lógica para reproducir la película
            // Por ejemplo: redirigir a un reproductor, abrir otra vista, etc.
            alert(`Reproduciendo: ${modalTitle.textContent}`);
        });
        console.log('✓ Evento botón ver película vinculado');
    }
    
    // Prevenir que el scroll del modal cierre el modal
    if (modalContainer) {
        modalContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    console.log('Eventos del modal inicializados correctamente');
}

// ========================================
// FUNCIONES AUXILIARES
// ========================================

// Función para abrir modal desde fuera (si es necesario)
window.abrirModalPorId = function(peliculaId, peliculas) {
    const pelicula = peliculas.find(p => p.id === peliculaId);
    if (pelicula) {
        mostrarModal(pelicula);
    } else {
        console.error('Película no encontrada:', peliculaId);
    }
}

// Función para cerrar modal desde fuera (si es necesario)
window.cerrarModalPelicula = cerrarModal;