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


// Get the button
let mybutton = document.getElementById("btn-back-to-top");

// When the user scrolls down 20px from the top of the document, show the button
// window.onscroll = function () {

// };

function scrollFunction() {
    if (
        document.body.scrollTop > 20 ||
        document.documentElement.scrollTop > 20
    ) {
        mybutton.style.display = "block";
    } else {
        mybutton.style.display = "none";
    }
}
// When the user clicks on the button, scroll to the top of the document
mybutton.addEventListener("click", backToTop);

function backToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}



const counters = document.querySelectorAll('.value');
const speed = 3000000;
const sec = document.querySelector('#status');


window.onload = () => {
    let top = window.scrollY;
    let offset = sec.offsetTop - 600;
    let height = sec.offsetHeight;

    if (top >= offset && top <= offset + height) {
        startCount();
    }
    else {
        window.addEventListener('scroll', () => {
            let top = window.scrollY;
            let offset = sec.offsetTop - 400;
            let height = sec.offsetHeight;

            if (top >= offset && top <= offset + height) {
                startCount();
            }
        });
    }

    const startCount = () => {

        counters.forEach(counter => {
            const animate = () => {
                const value = +counter.getAttribute('akhi');
                const data = +counter.innerText;

                const time = value / speed;
                if (data < value) {
                    counter.innerText = Math.ceil(data + time);
                    setTimeout(animate, 1);
                } else {
                    counter.innerText = value;
                }

            }

            animate();
        });
    }

}

let sections = document.querySelectorAll("section")

window.onscroll = () => {

    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 400;
        let height = sec.offsetHeight;

        if (top >= offset && top < offset + height) {
            sec.classList.add("show-animate");
        }
        // else {
        //     sec.classList.remove("show-animate");
        // }
    })
    scrollFunction();
}