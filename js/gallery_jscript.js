let data = {};
let currentCategory = null;
let currentIndex = 0;
const step = 6;

// Inicializa la galería
async function initGallery() {
  try {
    const res = await fetch("images.json");
    if (!res.ok) throw new Error("No se pudo cargar el JSON");
    data = await res.json();

    // Mostrar 6 imágenes aleatorias de todas las categorías al inicio
    const allImages = Object.values(data).flat();
    showImages(shuffle(allImages).slice(0, step));
  } catch (error) {
    console.error("Error al cargar las imágenes:", error);
  }
}

// Función para mostrar imágenes en el main
function showImages(images) {
  const galeria = document.getElementById("galeria");
  galeria.innerHTML = ""; // limpiar antes de mostrar nuevas

  images.forEach(img => {
    const picture = document.createElement("picture");

    // AVIF (opcional, si decides exportar)
    if (img.avif) {
      const sourceAvif = document.createElement("source");
      sourceAvif.srcset = img.avif;
      sourceAvif.type = "image/avif";
      picture.appendChild(sourceAvif);
    }

    // WebP
    if (img.webp) {
      const sourceWebp = document.createElement("source");
      sourceWebp.srcset = img.webp;
      sourceWebp.type = "image/webp";
      picture.appendChild(sourceWebp);
    }

    // JPG fallback
    const image = document.createElement("img");
    image.src = img.jpg;
    image.alt = img.alt || "";
    image.loading = "lazy";
    picture.appendChild(image);

    galeria.appendChild(picture);
  });
}

// Cargar categoría seleccionada
function loadCategory(cat) {
  if (!data[cat]) return;
  currentCategory = data[cat];
  currentIndex = 0;
  showImages(currentCategory.slice(currentIndex, currentIndex + step));
  highlightCategory(cat);
}

// Cargar siguiente bloque de imágenes (6 en 6)
function nextImages() {
  if (!currentCategory) return;
  currentIndex += step;
  if (currentIndex >= currentCategory.length) currentIndex = 0; // reinicia al final
  showImages(currentCategory.slice(currentIndex, currentIndex + step));
}

// Resalta el botón de categoría activo
function highlightCategory(cat) {
  document.querySelectorAll("section.portafolio button").forEach(btn => {
    btn.classList.remove("active");
    if (btn.dataset.filter === "." + cat) btn.classList.add("active");
  });
}

// Función helper para mezclar un array (aleatorio)
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// Inicializa al cargar la página
document.addEventListener("DOMContentLoaded", initGallery);
