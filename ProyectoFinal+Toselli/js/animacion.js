const btnAnimar = document.querySelector('.btn-animar');
const animacion = `
    <div class="animacion">
        <h1 class="ml1">CODERHOUSE</h1>
        <h1 class="ml2">Curso JavaScript</h1>
        <h1 class="ml5">Comisión: 51115</h1>
        <h1 class="ml3">Alumno: Santiago Toselli</h1>
        <h1 class="ml4">Profesor: Adrián González</h1>
        <h1 class="ml6">Abril 2023</h1>
    </div>
`;

btnAnimar.addEventListener('click', function () {
    btnAnimar.innerHTML = animacion;
    btnAnimar.className = 'animacion';

    const textWrappers = document.querySelectorAll('.animacion h1');
    const timeline = anime.timeline({ loop: false });

    for (let i = 0; i < textWrappers.length; i += 1) {
        const textWrapper = textWrappers[i];
        textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

        timeline.add({
            targets: textWrapper.querySelectorAll('.letter'),
            translateY: [-100, 0],
            easing: 'easeOutExpo',
            duration: 1400,
            delay: (el, i) => 30 * i
        }).add({
            targets: textWrapper,
            opacity: 100,
            duration: 1000,
            easing: 'easeOutExpo',
            delay: 100 + i
        });
    }
});
