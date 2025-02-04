document.addEventListener("DOMContentLoaded", () => {
  const movieCards = document.querySelectorAll(".movie-card");
  const descriptionBtn = document.getElementById("movie-description");
  const closeDescriptionBtn = document.getElementById("close-description");
  const accessReviewFormBtn = document.getElementById("go-to-review-form");
  const reviewsButton = document.getElementById("reviews-button");



  const descriptionCard = document.getElementById("description-card");

  let movieId = null;
  let reservationId = null;

  //movie card selection effect
  movieCards.forEach((card) => {
    card.addEventListener("click", async (e) => {
      e.preventDefault();
      let isSelected = card.classList.contains("outline-goldOne");

      movieCards.forEach((m) => {
        m.classList.remove("outline");
        m.classList.remove("outline-goldOne");
        m.classList.remove("outline-8");
      });

      if (!isSelected) {
        card.classList.add("outline");
        card.classList.add("outline-goldOne");
        card.classList.add("outline-8");
      }

      let anySelected = false;
      movieCards.forEach((m) => {
        if (m.classList.contains("outline-goldOne")) {
          anySelected = true;
        }
      });

      movieCards.forEach((m) => {
        if (m.classList.contains("outline-goldOne")) {
          anySelected = true;
          movieId = m.getAttribute("data-movie-id");
          reservationId = m.getAttribute("data-reservation-id")


        }
      });

      if (anySelected) {
        accessReviewFormBtn.href = `/dashboard/user/reviews-form/${movieId}`
        descriptionBtn.classList.remove("hidden");
        descriptionBtn.classList.add("flex");
      } else {
        descriptionBtn.classList.remove("flex");
        descriptionBtn.classList.add("hidden");
      }

      const reservationInfo = await fetchReservationInfo(reservationId);
      if (reservationInfo) {
        checkIfMovieEnded(reservationInfo);
      }

      if (!anySelected) {
        movieId = null;
        reservationId = null;
        accessReviewFormBtn.href = "#";
      }
    });
  });

  async function fetchReservationInfo(reservationId) {
    try {
      const response = await fetch("/api/v1/reservation/info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reservationId }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reservationInfo = await response.json();
      return reservationInfo;
    } catch (error) {
      console.error("Error fetching reservation info:", error);
      return null;
    }
  }

  descriptionBtn.addEventListener("click", async () => {
    if (!reservationId) return;

    const reservationInfo = await fetchReservationInfo(reservationId);
    if (reservationInfo) {
      displayReservationInfo(reservationInfo);
      
    }

    window.scrollTo({
      top: 210,
      behavior: "smooth",
    });
    descriptionCard.classList.toggle("hidden");
    descriptionCard.classList.toggle("flex");
  });

  closeDescriptionBtn.addEventListener("click", () => {
    descriptionCard.classList.add("hidden");
    descriptionCard.classList.remove("flex");
  });

  function formatDateToFrench(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(date);
  }

  function displayReservationInfo(info) {
    descriptionCard.querySelector(".movie-title").textContent = info.movie_title;
    descriptionCard.querySelector(".movie-date").textContent = formatDateToFrench(info.showtime_day);
    descriptionCard.querySelector(".movie-time").textContent = info.start_time.substring(0, 5);
    descriptionCard.querySelector(".movie-duration").textContent = `Durée : ${info.movie_duration} min`;
    descriptionCard.querySelector(".movie-end-time").textContent = `Fin prévue à ${info.end_time.substring(0, 5)}`;
    descriptionCard.querySelector(".movie-poster").src = `/uploads/${info.movie_poster}`;
    descriptionCard.querySelector(".cinema-name").textContent = info.cinema_name;
    descriptionCard.querySelector(".cinema-location").textContent = info.cinema_location;
    descriptionCard.querySelector(".movie-seats").textContent = `${info.seats_reserved.length} Place${info.seats_reserved > 1 ? 's' : ''}`;
    descriptionCard.querySelector(".movie-quality").textContent = info.quality;
    descriptionCard.querySelector(".movie-hall").textContent = `Salle ${info.room_name}`;
    descriptionCard.querySelector(".movie-accessibility").textContent = info.seat_accessibility  ? 'Accessible aux PMR' : 'Non accessible aux PMR';
  }

  function checkIfMovieEnded(info) {
    const endTime = new Date(info.showtime_day + ' ' + info.end_time);
    const now = new Date();

    if (now > endTime) {
      reviewsButton.disabled = false;
      reviewsButton.classList.remove('opacity-50');
    } else {
      reviewsButton.disabled = true;
      reviewsButton.classList.add('opacity-50');
    }
  }

  function checkIfMovieEnded(info) {



    // Extract date from showtime_day and create a full date-time string with end_time
    const showtimeDate = new Date(info.showtime_day);
    const [endHour, endMinute, endSecond] = info.end_time.split(':');
    showtimeDate.setHours(endHour, endMinute, endSecond);



    const now = new Date();



    if (now > showtimeDate) {
      reviewsButton.disabled = false;
      reviewsButton.classList.remove('opacity-50');
    } else {
      reviewsButton.disabled = true;
      reviewsButton.classList.add('opacity-50');
    }
  }

});
