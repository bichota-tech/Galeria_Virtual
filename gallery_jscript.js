/*descargar el contenido del html para acceder a el */
document.addEventListener('DOMContentLoaded', () => {
    /*acceder a las imagenes a traves de su id y clase*/
    const selected = document.getElementById('selected');
    const miniaturas = document.querySelectorAll('.miniatura');

    const modal = document.getElementById("modal")
    const cerrar = document.getElementById("cerrar")

    miniaturas.forEach(mini => {
        mini.addEventListener('click', () => {
            selected.src = mini.src;
        });
    });

    miniaturas.forEach(mini => {
        mini.addEventListener('click', () => {
            miniaturas.forEach(m => m.classList.remove('activa'));
            mini.classList.add('activa');
        });
    });

    function abrirModalImagen(event) {
        modal.style.display = "block";
        selected.src = event.target.src;
    }

    function cerrarModal() {
        modal.style.display = "none";
    }

    function cerrarModalAlFondo(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }

    selected.forEach(img => {
        img.addEventListener("click", abrirModalImagen);
    });
    cerrar.addEventListener("click", cerrarModal);
    window.addEventListener("click", cerrarModalAlFondo);

})
