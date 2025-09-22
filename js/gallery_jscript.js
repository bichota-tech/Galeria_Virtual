// js/gallery_jscript.js
let data = {};
let currentCategory = null;
let currentIndex = 0;
const step = 6;

const galleryEl = document.getElementById('galeria');

async function initGallery() {
  try {
    console.log('Cargando imagenes.json ...');
    const res = await fetch('imagenes.json');
    if (!res.ok) throw new Error(`Fetch imagenes.json -> ${res.status} ${res.statusText}`);
    data = await res.json();
    console.log('JSON cargado:', data);

    // Asignar listeners a botones data-filter
    document.querySelectorAll('button[data-filter]').forEach(btn => {
      const cat = btn.dataset.filter.replace('.', '');
      btn.addEventListener('click', () => loadCategory(cat));
    });

    // Mostrar 6 aleatorias de todas las categorias
    const allImages = Object.values(data).flat();
    if (!allImages.length) {
      galleryEl.innerHTML = '<p>No hay imágenes en el JSON.</p>';
      return;
    }
    showImages(shuffle(allImages).slice(0, step));
  } catch (err) {
    console.error(err);
    if (galleryEl) galleryEl.innerHTML = `<p>Error cargando imagenes: ${err.message}</p>`;
  }
}

function showImages(images) {
  galleryEl.innerHTML = '';
  images.forEach(img => {
    if (!img.jpg && !img.webp) {
      console.warn('Imagen sin ruta válida en JSON:', img);
      return;
    }

    const picture = document.createElement('picture');

    if (img.avif) {
      const sAvif = document.createElement('source');
      sAvif.srcset = img.avif;
      sAvif.type = 'image/avif';
      picture.appendChild(sAvif);
    }

    if (img.webp) {
      const sWebp = document.createElement('source');
      sWebp.srcset = img.webp;
      sWebp.type = 'image/webp';
      picture.appendChild(sWebp);
    }

    const image = document.createElement('img');
    image.src = img.jpg || img.webp; // fallback
    image.alt = img.alt || '';
    image.loading = 'lazy';

    image.addEventListener('error', () => {
      console.error('Error cargando imagen:', image.src);
      image.style.opacity = '0.4';
      image.title = 'Error al cargar imagen';
    });

    picture.appendChild(image);
    galleryEl.appendChild(picture);
  });
}

function loadCategory(cat) {
  if (!data[cat]) {
    console.warn('Categoría no encontrada:', cat);
    return;
  }
  currentCategory = data[cat];
  currentIndex = 0;
  showImages(currentCategory.slice(currentIndex, currentIndex + step));
  // marcar botón activo
  document.querySelectorAll('button[data-filter]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === '.' + cat);
  });
}

function nextImages() {
  if (!currentCategory) return;
  currentIndex += step;
  if (currentIndex >= currentCategory.length) currentIndex = 0;
  showImages(currentCategory.slice(currentIndex, currentIndex + step));
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

document.addEventListener('DOMContentLoaded', initGallery);
// Hacer accesibles estas funciones si usas onclick desde HTML
window.nextImages = nextImages;
window.loadCategory = loadCategory;
