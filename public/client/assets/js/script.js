document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('promo-track');
  const dots = document.querySelectorAll('#promo-dots .dot');
  
  if(!track || dots.length === 0) return;

  let currentIndex = 0;
  let autoplayInterval;
  const slideTo = (index) => {
    const itemWidth = track.children[0].getBoundingClientRect().width;
    const gap = 30; 
    const moveDistance = (itemWidth + gap) * index;
    
    track.style.transform = `translateX(-${moveDistance}px)`;

    dots.forEach(dot => dot.classList.remove('active'));
    dots[index].classList.add('active');
    
    currentIndex = index;
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      const clickedIndex = parseInt(e.target.getAttribute('data-index'));
      slideTo(clickedIndex);
      
      resetAutoplay();
    });
  });

  const startAutoplay = () => {
    autoplayInterval = setInterval(() => {
      let nextIndex = (currentIndex + 1) % dots.length;
      slideTo(nextIndex);
    }, 4000);
  };

  const resetAutoplay = () => {
    clearInterval(autoplayInterval);
    startAutoplay();
  };
  startAutoplay();
});