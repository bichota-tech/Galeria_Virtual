document.addEventListener("DOMContentLoaded", () => {
  const mycarousel = document.querySelector("#mycarousel");
  const clientesCarousel = document.querySelector('#carouselClientes');
  
  //inicializar carrusel de inicio
  const carousel = new
    bootstrap.Carousel(mycarousel, {
      interval: 3000, //tiempo entre slides (ms) (0 = no auto)
      ride: "carousel", //para que arranque solo
      pause: "hover", //se detiene al pasar el mouse
      wrap: true // vuelve al inicio tras el ultimo slide
    });
    
    //inicializar carrusel de clientes
  const carousel1 = new bootstrap.Carousel(clientesCarousel, {
    interval: 4000, // 5 segundos
    ride: 'carousel',
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
})

//Marcar enlace menunav al hacer click
const navLinks = document.querySelectorAll(".nav-link");
// Obtener info de la URL actual
const currentPage = window.location.pathname.split("/").pop(); // index.html o gallery.html
const currentHash = window.location.hash; // #servicios, #clientes o vacío

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    navLinks.forEach(l => l.classList.remove("active")); // quita el active de los demás
    link.classList.add("active"); // marca el clicado
  });
});

navLinks.forEach(link => {
  // Analizar href del enlace
  const tempLink = document.createElement("a");
  tempLink.href = link.href;

  const linkPage = tempLink.pathname.split("/").pop(); // nombre del HTML
  const linkHash = tempLink.hash; // hash del enlace

  // Si coincide página y hash
  if (linkPage === currentPage && linkHash === currentHash) {
    link.classList.add("active");
  }
  
  // Si el enlace es solo la página sin hash
  if (linkPage === currentPage && !linkHash && !currentHash) {
    link.classList.add("active");
  }
});

let data = {};
let currentImages = [];
const STEP = 4; // número de imágenes por categoría
const galleryEl = () => document.getElementById('gallery-container');

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

async function initIndexGallery() {
  try {
    const res = await fetch('imagenes.json');
    if (!res.ok) throw new Error(`Fetch imagenes.json -> ${res.status} ${res.statusText}`);
    data = await res.json();

    // Asignar eventos a botones
        document.querySelectorAll('button[data-filter]').forEach(btn => {
      const cat = btn.dataset.filter.replace('.', '');
      btn.addEventListener('click', () => {
        loadCategory(cat);
      });
    });

    // Mostrar 4 aleatorias al inicio (mezcla todas las categorías)
    const allImages = Object.values(data).flat();
    if (!allImages.length) {
      galleryEl().innerHTML = '<p>No hay imágenes en el JSON.</p>';
      return;
    }

    currentImages = shuffle(allImages).slice(0, STEP); // mostramos sólo 4
    currentIndex = 0;
    showImages(currentImages);

  } catch (err) {
    console.error('Error inicializando galería index:', err);
    galleryEl().innerHTML = '<p>Error cargando imágenes.</p>';
  }
}

function showImages(images) {
  const container = galleryEl();
  container.innerHTML = '';
  images.forEach(img => {
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-3';
    col.innerHTML = `
      <div class="card">
        <img src="${img.jpg}" alt="${img.alt}" class="card-img-top">
      </div>`;
    container.appendChild(col);
  });
}

function loadCategory(category) {
  if (Array.isArray(data[category])) {
    // Mostrar solo 4 de esa categoría, aleatorias
    currentImages = shuffle(data[category]).slice(0, STEP);
  } else {
    currentImages = [];
  }
  document.querySelectorAll('button[data-filter]').forEach(btn => {
    btn.classList.toggle('activa', btn.dataset.filter === '.' + category);
  });
  
  showImages(currentImages);
}

// Inicializar
initIndexGallery();





// Validación Bootstrap + feedback
    // (function () {
    //   'use strict'
    //   const form = document.getElementById('contactForm');
    //   const successMsg = document.getElementById('successMsg');
    //   const errorMsg = document.getElementById('errorMsg');

    //   form.addEventListener('submit', function (event) {
    //     event.preventDefault();
    //     if (!form.checkValidity()) {
    //       event.stopPropagation();
    //       form.classList.add('was-validated');
    //     } else {
    //       // Simulación de envío
    //       successMsg.classList.remove('d-none');
    //       errorMsg.classList.add('d-none');
    //       form.reset();
    //       form.classList.remove('was-validated');
    //     }
    //   }, false);
    // })();








