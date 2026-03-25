const menuBtn = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

// overlay
const overlay = document.createElement('div');
overlay.classList.add('overlay');
document.body.appendChild(overlay);

// open menu
menuBtn.onclick = () => {
  mobileMenu.classList.add('active');
  overlay.classList.add('active');
};

// close menu
overlay.onclick = () => {
  mobileMenu.classList.remove('active');
  overlay.classList.remove('active');
};

// dropdown mobile
document.querySelectorAll('.has-sub').forEach(item => {
  item.addEventListener('click', () => {
    item.classList.toggle('active');
  });
});