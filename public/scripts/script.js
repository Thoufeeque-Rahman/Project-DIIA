// Remove the transition class
const square = document.querySelector('.about-div');
square.classList.remove('about-div-transition');

// Create the observer, same as before:
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            square.classList.add('about-div-transition');
            return;
        }

        square.classList.remove('about-div-transition');
    });
});

observer.observe(document.querySelector('.ad-ad'));

document.querySelectorAll('.grid-image').forEach(item => {
    item.addEventListener('click', event => {
        let imgSrc = event.target.getAttribute('src');
        console.log('imgSrc:', imgSrc); // Debugging line
        let modalImg = document.querySelector('#exampleModal img');
        console.log('modalImg:', modalImg); // Debugging line
        modalImg.setAttribute('src', imgSrc);
        imgSrc.toggleclass('grid-image-hover');

    });
});