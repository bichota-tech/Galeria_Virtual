document.addEventListener("DOMContentLoaded", () => {
  const mycarousel = document.querySelector("#mycarousel");

  //inicializar carrusel de inicio
  const carousel = new
    bootstrap.Carousel(mycarousel, {
      interval: 3000, //tiempo entre slides (ms) (0 = no auto)
      ride: "carousel", //para que arranque solo
      pause: "hover", //se detiene al pasar el mouse
      wrap: true // vuelve al inicio tras el ultimo slide
    });

  //Botones

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  prevBtn.addEventListener("click", (e) => {
    e.preventDefault(); //evita el salto de pagina
    carousel.prev();
  })

  nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    carousel.next();
  });

  //inicializar carrusel de clientes
  const clientesCarousel = document.querySelector('#carouselClientes');
  const carousel1 = new bootstrap.Carousel(clientesCarousel, {
    interval: 5000, // 5 segundos
    ride: 'carousel'
  });

})

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

    if (filter === 'all') {
      // Resetear
      activeFilters = [];
      mixer.filter('all');
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      return;
    }

    // Activar/desactivar filtros
    if (activeFilters.includes(filter)) {
      activeFilters = activeFilters.filter(f => f !== filter);
      btn.classList.remove('active');
    } else {
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







