// Inicializar MixItUp en el contenedor
var containerEl = document.querySelector('.container-filtros');
var mixer = mixitup(containerEl, {
  animation: { duration: 300 }
});

// Guardamos categorías activas
let activeFilters = [];

// Todos los botones
const buttons = document.querySelectorAll('[data-filter]');

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.getAttribute('data-filter');

    // Activar/desactivar filtros
    if (activeFilters.includes(filter)) {
      activeFilters = activeFilters.filter(f => f !== filter);
      btn.classList.remove('active');
    } else {
      activeFilters = []; // Permitir solo un filtro activo a la vez
      buttons.forEach(b => b.classList.remove('active'));
      activeFilters.push(filter);
      btn.classList.add('active');
    }

    // Si no hay filtros, mostrar todo
    if (activeFilters.length === 0) {
      mixer.filter('.inicial'); // Mostrar solo la sesión inicial
    } else {
      mixer.filter(activeFilters.join(', '));
    }
  });
});

var mixer = mixitup('.container-filtros', {
  animation: {
    effects: 'fade scale(0.75)', // fade + zoom
    duration: 500,               // velocidad (ms)
    easing: 'ease-in-out'        // suavidad
  }
});

// 👉 Mostrar inicialmente solo 1 sesión por categoría
mixer.filter('.inicial');


