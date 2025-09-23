// js/gallery_jscript.js
let data = {};
let displayedImages = []; // array actual mostrado (puede ser de una categoría o mezcla)
let currentIndex = 0;
const STEP = 6;

const galleryEl = () => document.getElementById('galeria');
const verMasBtn = () => document.getElementById('ver-mas');

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
    displayedImages = shuffle(allImages);
    showImages(displayedImages.slice(0, STEP));

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
  displayedImages = images.slice(); // snapshot del conjunto actual mostrado

  images.forEach((imgObj, idx) => {
    if (!imgObj || (!imgObj.jpg && !imgObj.webp)) {
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
    image.src = imgObj.jpg || imgObj.webp;
    image.alt = imgObj.alt || '';
    image.dataset.index = idx; // índice dentro de displayedImages

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

  // cargamos la categoría por bloques de STEP
  displayedImages = data[cat].slice(); // copia
  // iniciar desde el 0
  currentIndex = 0;
  showImages(displayedImages.slice(currentIndex, currentIndex + STEP));
}

function nextImages() {
  if (!displayedImages || !displayedImages.length) return;

  currentIndex += STEP;
  if (currentIndex >= displayedImages.length) {
    currentIndex = 0; // reinicia al llegar al final
  }
  showImages(displayedImages.slice(currentIndex, currentIndex + STEP));
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
  // index corresponde a displayedImages
  if (!displayedImages || !displayedImages.length) return;
  currentIndex = index % displayedImages.length;
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
  if (!displayedImages || !displayedImages.length) return;
  currentIndex = (currentIndex + direction + displayedImages.length) % displayedImages.length;
  updateLightboxContent();
  preloadImage(getImageSrc(getNextIndex()));
}

function updateLightboxContent() {
  const obj = displayedImages[currentIndex];
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
  img.src = obj.jpg || obj.webp;
  img.alt = obj.alt || '';
  img.className = 'lb-img';
  img.loading = 'lazy';

  // precarga: mostrar un pequeño placeholder si tarda (puedes mejorar con LQIP)
  img.addEventListener('error', () => {
    console.error('Error al cargar imagen lightbox:', img.src);
    lbCaption().textContent = 'Error al cargar imagen';
  });

  picture.appendChild(img);
  container.appendChild(picture);

  // caption opcional
  lbCaption().textContent = obj.alt || `${currentIndex + 1} / ${displayedImages.length}`;
}

function preloadImage(src) {
  if (!src) return;
  const i = new Image();
  i.src = src;
}

function getImageSrc(idx) {
  const o = displayedImages[idx];
  if (!o) return null;
  return o.webp || o.avif || o.jpg;
}
function getNextIndex() {
  return (currentIndex + 1) % displayedImages.length;
}

const h1 = document.getElementById('titulo-galeria');
const buttons = document.getElementById('filter-buttons');
const headerHeight = document.querySelector('.header').offsetHeight;

// Offset para que el scroll active cuando el h1 esté casi fuera de vista
const triggerOffset = h1.offsetTop + h1.offsetHeight - headerHeight;

window.addEventListener('scroll', () => {
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
