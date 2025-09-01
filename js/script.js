document.getElementById("DOMContentLoaded", function () {
    
})
const swiper = new Swiper('.swiper', {
    loop: true,              // carrusel infinito
    autoplay: {
      delay: 3000,           // cambia cada 3s
      disableOnInteraction: false,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,       // bullets clicables
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    effect: 'slide',         // puedes probar 'fade', 'cube', 'coverflow'
    speed: 800,              // transición más fluida
  });


 
