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


// Thay đổi ảnh Gallery
function changeImage(element) {
  const newSrc = element.src;
  document.getElementById('main-image').src = newSrc;
  
  const thumbs = document.querySelectorAll('.gallery-thumbs img');
  thumbs.forEach(thumb => thumb.classList.remove('active'));
  
  element.classList.add('active');
}


document.addEventListener("DOMContentLoaded", () => {
  // 1. CHỨC NĂNG MỞ/ĐÓNG MOBILE MENU
  const mobileToggleBtn = document.querySelector(".mobile-toggle-btn");
  const mobileCloseBtn = document.querySelector(".mobile-close-btn");
  const navMenuWrapper = document.querySelector(".nav-menu-wrapper");
  const mobileOverlay = document.querySelector(".mobile-overlay");

  if (mobileToggleBtn && navMenuWrapper && mobileOverlay) {
    // Hàm mở menu
    mobileToggleBtn.addEventListener("click", () => {
      navMenuWrapper.classList.add("active");
      mobileOverlay.classList.add("active");
      document.body.style.overflow = "hidden"; // Khóa cuộn trang nền
    });

    // Hàm đóng menu
    const closeMenu = () => {
      navMenuWrapper.classList.remove("active");
      mobileOverlay.classList.remove("active");
      document.body.style.overflow = "auto"; // Mở khóa cuộn trang
    };

    mobileCloseBtn.addEventListener("click", closeMenu);
    mobileOverlay.addEventListener("click", closeMenu);
  }

  // 2. CHỨC NĂNG XỔ MENU CON (ACCORDION) TRONG MOBILE MENU
  const menuArrows = document.querySelectorAll(".nav-links .arrow");
  
  menuArrows.forEach((arrow) => {
    arrow.addEventListener("click", function (e) {
   
      if (window.innerWidth <= 992) {
        e.preventDefault();
       
        const parentLi = this.closest("li");
        const dropdown = parentLi.querySelector(".dropdown");
        
        if (dropdown) {
          dropdown.classList.toggle("active");
          this.classList.toggle("active"); 
        }
      }
    });
  });
});