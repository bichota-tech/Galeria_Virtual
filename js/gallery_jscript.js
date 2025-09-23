// js/gallery_jscript.js
let data = {};
let currentImages = []; // conjunto actual usado por la galería y el lightbox
let currentIndex = 0;
const STEP = 6;

const galleryEl = () => document.getElementById('galeria');

const lightboxEl = () => document.getElementById('lightbox');
const lbInner = () => document.querySelector('.lb-inner');
const lbCaption = () => document.querySelector('.lb-caption');
const lbClose = () => document.querySelector('.lb-close');
const lbPrev = () => document.querySelector('.lb-prev');
const lbNext = () => document.querySelector('.lb-next');

async function initGallery() {
  try {
    const res = await fetch('imagenes.json');
    if (!res.ok) throw new Error(`Fetch imagenes.json -> ${res.status} ${res.statusText}`);
    data = await res.json();

    // Assign buttons listeners
    document.querySelectorAll('button[data-filter]').forEach(btn => {
      const cat = btn.dataset.filter.replace('.', '');
      btn.addEventListener('click', () => {
        loadCategory(cat);
      });
    });

    // Mostrar 6 aleatorias al inicio (mezcla todas las categorías)
    const allImages = Object.values(data).flat();
    if (!allImages.length) {
      galleryEl().innerHTML = '<p>No hay imágenes en el JSON.</p>';
      return;
    }

    currentImages = shuffle(allImages).slice(0, STEP); // mostramos sólo 6 aleatorias al inicio
    currentIndex = 0;
    showImages(currentImages);

    // Lightbox events
    setupLightboxControls();

  } catch (err) {
    console.error(err);
    galleryEl().innerHTML = `<p>Error cargando imágenes: ${err.message}</p>`;
  }
}

function showImages(images) {
  // images: array de objetos { jpg, webp, avif?, alt }
  const container = galleryEl();
  container.innerHTML = '';

  // Guardamos como conjunto actual (para lightbox / navegación)
  currentImages = images.slice();

  images.forEach((imgObj, idx) => {
    if (!imgObj || (!imgObj.jpg && !imgObj.webp && !imgObj.avif)) {
      console.warn('Imagen con ruta inválida en JSON', imgObj);
      return;
    }

    const picture = document.createElement('picture');

    if (imgObj.avif) {
      const sAvif = document.createElement('source');
      sAvif.srcset = imgObj.avif;
      sAvif.type = 'image/avif';
      picture.appendChild(sAvif);
    }

    if (imgObj.webp) {
      const sWebp = document.createElement('source');
      sWebp.srcset = imgObj.webp;
      sWebp.type = 'image/webp';
      picture.appendChild(sWebp);
    }

    const image = document.createElement('img');
    image.className = 'gallery-img';
    image.loading = 'lazy';
    image.src = imgObj.jpg || imgObj.webp || imgObj.avif;
    image.alt = imgObj.alt || '';
    image.dataset.index = idx; // índice dentro de currentImages

    // click abre lightbox en la posición correspondiente
    image.addEventListener('click', (e) => {
      const i = Number(e.currentTarget.dataset.index);
      openLightbox(i);
    });

    // manejo de error de carga
    image.addEventListener('error', () => {
      console.error('Error al cargar imagen:', image.src);
      image.style.opacity = '0.4';
      image.title = 'Error al cargar imagen';
    });

    picture.appendChild(image);
    container.appendChild(picture);
  });
}

function loadCategory(cat) {
  if (!data[cat]) {
    console.warn('Categoría no encontrada:', cat);
    return;
  }
  // destacar botón activo
  document.querySelectorAll('button[data-filter]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === '.' + cat);
  });

  // cargamos TODAS las imágenes de la categoría (sin cortar)
  const categoryImages = data[cat].slice();
  currentIndex = 0;
  showImages(categoryImages); // ahora showImages recibe el array completo de la categoría
}

function nextImages() {
  if (!currentImages || !currentImages.length) return;

  currentIndex += STEP;
  if (currentIndex >= currentImages.length) {
    currentIndex = 0; // reinicia al llegar al final (o quita este comportamiento si no lo quieres)
  }
  // mostrar desde currentIndex (si quieres paginar)
  showImages(currentImages.slice(currentIndex, currentIndex + STEP));
}

/* ---------- Lightbox / Modal ---------- */

function setupLightboxControls() {
  const lb = lightboxEl();
  if (!lb) return;

  lbClose().addEventListener('click', closeLightbox);
  lbPrev().addEventListener('click', () => changeLightbox(-1));
  lbNext().addEventListener('click', () => changeLightbox(1));

  // cerrar al click en overlay (fuera del contenido)
  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
  });

  // teclado
  document.addEventListener('keydown', (e) => {
    if (lb.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') changeLightbox(-1);
    if (e.key === 'ArrowRight') changeLightbox(1);
  });

  // swipe simple (móvil)
  let startX = 0;
  lb.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  }, {passive:true});

  lb.addEventListener('touchend', (e) => {
    const dx = (e.changedTouches[0].clientX - startX);
    if (Math.abs(dx) > 50) {
      if (dx > 0) changeLightbox(-1); else changeLightbox(1);
    }
  });
}

function openLightbox(index) {
  // index corresponde a currentImages
  if (!currentImages || !currentImages.length) return;
  currentIndex = ((index % currentImages.length) + currentImages.length) % currentImages.length;
  updateLightboxContent();
  const lb = lightboxEl();
  lb.classList.remove('hidden');
  lb.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // bloquear scroll del fondo
  // precarga siguiente
  preloadImage(getImageSrc(getNextIndex()));
}

function closeLightbox() {
  const lb = lightboxEl();
  lb.classList.add('hidden');
  lb.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = ''; // restaurar scroll
  // limpiar contenido si quieres
  lbInner().innerHTML = '';
  lbCaption().textContent = '';
}

function changeLightbox(direction) {
  if (!currentImages || !currentImages.length) return;
  currentIndex = (currentIndex + direction + currentImages.length) % currentImages.length;
  updateLightboxContent();
  preloadImage(getImageSrc(getNextIndex()));
}

function updateLightboxContent() {
  const obj = currentImages[currentIndex];
  if (!obj) return;
  const container = lbInner();
  container.innerHTML = ''; // limpiar

  // construir picture grande (respeta avif/webp/jpg)
  const picture = document.createElement('picture');
  if (obj.avif) {
    const sAvif = document.createElement('source');
    sAvif.srcset = obj.avif;
    sAvif.type = 'image/avif';
    picture.appendChild(sAvif);
  }
  if (obj.webp) {
    const sWebp = document.createElement('source');
    sWebp.srcset = obj.webp;
    sWebp.type = 'image/webp';
    picture.appendChild(sWebp);
  }

  const img = document.createElement('img');
  img.src = obj.jpg || obj.webp || obj.avif;
  img.alt = obj.alt || '';
  img.className = 'lb-img';
  img.loading = 'lazy';

  img.addEventListener('error', () => {
    console.error('Error al cargar imagen lightbox:', img.src);
    lbCaption().textContent = 'Error al cargar imagen';
  });

  picture.appendChild(img);
  container.appendChild(picture);

  // caption opcional
  lbCaption().textContent = obj.alt || `${currentIndex + 1} / ${currentImages.length}`;
}

function preloadImage(src) {
  if (!src) return;
  const i = new Image();
  i.src = src;
}

function getImageSrc(idx) {
  const o = currentImages[idx];
  if (!o) return null;
  return o.webp || o.avif || o.jpg;
}
function getNextIndex() {
  return (currentIndex + 1) % currentImages.length;
}

/* ---------- scroll header / botones (igual que antes) ---------- */
const h1 = document.getElementById('titulo-galeria');
const buttons = document.getElementById('filter-buttons');
const headerHeight = document.querySelector('.header') ? document.querySelector('.header').offsetHeight : 0;

// Offset para que el scroll active cuando el h1 esté casi fuera de vista
const triggerOffset = h1 ? (h1.offsetTop + h1.offsetHeight - headerHeight) : 0;

window.addEventListener('scroll', () => {
  if (!h1 || !buttons) return;
  if (window.scrollY > triggerOffset) {
    // Oculta h1 y fija botones
    h1.classList.add('hidden-title');
    buttons.classList.add('fixed-buttons');
  } else {
    // Muestra h1 y devuelve botones a su posición
    h1.classList.remove('hidden-title');
    buttons.classList.remove('fixed-buttons');
  }
});

/* ---------- Helpers ---------- */
function shuffle(arr) {
  return arr.slice().sort(() => Math.random() - 0.5);
}

/* iniciar */
document.addEventListener('DOMContentLoaded', initGallery);
