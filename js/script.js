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
    
    //inicializar carrusel de clientes
  const clientesCarousel = document.querySelector('#carouselClientes');
  const carousel1 = new bootstrap.Carousel(clientesCarousel, {
    interval: 4000, // 5 segundos
    ride: 'carousel'
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

// Validación Bootstrap + feedback
    (function () {
      'use strict'
      const form = document.getElementById('contactForm');
      const successMsg = document.getElementById('successMsg');
      const errorMsg = document.getElementById('errorMsg');

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (!form.checkValidity()) {
          event.stopPropagation();
          form.classList.add('was-validated');
        } else {
          // Simulación de envío
          successMsg.classList.remove('d-none');
          errorMsg.classList.add('d-none');
          form.reset();
          form.classList.remove('was-validated');
        }
      }, false);
    })();








