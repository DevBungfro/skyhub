const backToTopButton = document.querySelector(".back-to-top");
const slider = document.getElementById("checkbox");

const goToTop = () => {
  document.body.scrollIntoView({
    behavior: "smooth"
  });
};

document.addEventListener("DOMContentLoaded", function() {
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      document.getElementById('mainNav').classList.add('fixed-top');
      backToTopButton.classList.remove("hidden");

      navbar_height = document.querySelector('.navbar').offsetHeight;
      document.body.style.paddingTop = navbar_height + 'px';
    } else {
      document.getElementById('mainNav').classList.remove('fixed-top');
      backToTopButton.classList.add("hidden");

      document.body.style.paddingTop = '0';
    }
  });
});

backToTopButton.addEventListener("click", goToTop);

function changeTheme() {
  if (checkbox.checked) {
    document.getElementById("themestyle").setAttribute("href", "/css/dark-home.css");
    localStorage.setItem('theme', 'dark');

  } else {
    document.getElementById("themestyle").setAttribute("href", "/css/light-home.css");
    localStorage.setItem('theme', 'light');

  }
}

if (localStorage.getItem('theme') == "dark") {

  document.getElementById("themestyle").setAttribute("href", "/css/dark-home.css");
  checkbox.checked = true;
} else {
  document.getElementById("themestyle").setAttribute("href", "/css/light-home.css");


}