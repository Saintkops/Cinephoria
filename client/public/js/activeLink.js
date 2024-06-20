document.addEventListener("DOMContentLoaded", function() {
    const navLinks = document.querySelectorAll("nav .nav a");
    const aLinks = document.querySelectorAll("a[href]")
    const globalPath = window.location.pathname;

    switch (globalPath) {
        case "/":
            setActiveLink("/accueil");
            break;
        case "/accueil":
            setActiveLink("/accueil");
            break;
        case "/films":
        case "/films/disponibiliter":
            setActiveLink("/films");
            break;
        case "/reservation":
        case "/reservation/choisir-sceance":
        case "/reservation/login":
        case "/reservation/choisir-place":
            setActiveLink("/reservation");
            break;
        case "/contact":
            setActiveLink("/contact");
            break;
        case "/login":
        case "/reset/forgot-password":
            //modify later
        case "/dashboard/users":
            setActiveLink("/dashboard/users");
            sideBarSetActiveLink("/dashboard/users");
            break;
        case "/dashboard/admin":
            setActiveLink("/dashboard/admin");
            sideBarSetActiveLink("/dashboard/admin");
            break;
        case "/register":
            setActiveLink("/register");
            break;
        default:
            break;
    }

    function setActiveLink(path) {
        navLinks.forEach(link => {
            if (link.getAttribute("href") === path) {
                link.parentElement.classList.add("active");
            } 
        });
    }

    function sideBarSetActiveLink(path) {
        aLinks.forEach(link => {
          if (link.getAttribute("href") === path) {
            const button = link.querySelector('button');
            if (button) {
              button.classList.add('bg-goldOne');
            }
          }
        });
      }


});
