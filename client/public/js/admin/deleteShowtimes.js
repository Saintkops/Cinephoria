document.addEventListener("DOMContentLoaded", () => {

  const currentUrl = new URL(window.location.href);
  if (currentUrl.searchParams.has("showtimesId")) {
    currentUrl.searchParams.delete("showtimesId");
    window.history.replaceState({}, "", currentUrl.toString());
  }


  const currentPage = window.location.pathname;

  if (currentPage === "/dashboard/admin/showtimes/delete") {
 
    const theaterMenuBtn = document.getElementById("select-theater");
    const theaterList = document.querySelectorAll("#theater-list li");
    const choosenTheater = document.getElementById("cinema-choosen");
    const theaterMenu = document.getElementById("theater-menu");
    const cinemaIdInput = document.getElementById("cinema-id");

    const roomsMenuBtn = document.getElementById("select-room");
    const roomsMenu = document.getElementById("room-menu");
    const choosenRooms = document.getElementById("room-choosen");
    const roomsList = document.querySelectorAll("#room-list li");
    const roomListContainer = document.getElementById("room-list");
    const roomIdInput = document.getElementById("room-id");
    const currentRoomNameInput = document.getElementById("current-room-name");

    const showtimesMenuBtn = document.getElementById("select-showtimes");
    const showtimesMenu = document.getElementById("showtimes-menu");
    const showtimesList = document.getElementById("showtimes-list");
    const choosenShowtimes = document.getElementById("showtimes-choosen");


    const openAlertBtn = document.getElementById("open-alert-btn");
    const alertMenu = document.getElementById("alert");
    const closeAlertBtn = document.getElementById("close-alert");
    const submitFormBtn = document.getElementById("submit-form");

    let selectedCinemaId = null;

    let selectedMovieId = null;
    let selectedMovieDuration = 0;

    const closeAllMenu = () => {
      theaterMenu.classList.add("hidden");
      roomsMenu.classList.add("hidden");
      showtimesMenu.classList.add("hidden");
    };


    theaterMenuBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const isHidden = theaterMenu.classList.contains("hidden");
      closeAllMenu();
      if (isHidden) {
        theaterMenu.classList.toggle("hidden");
      }
    });


    theaterList.forEach((item) => {
      item.addEventListener("click", () => {
        selectedCinemaId = item.dataset.cinemaId;
        choosenTheater.textContent = item.textContent;
        cinemaIdInput.value = selectedCinemaId;
        theaterMenu.classList.add("hidden");


        fetch(`/api/v1/getRoomsByCinema/${selectedCinemaId}`)
          .then((response) => response.json())
          .then((data) => {
            roomListContainer.innerHTML = "";
            if (data.rooms && data.rooms.length > 0) {
              data.rooms.forEach((room) => {
                const li = document.createElement("li");
                li.textContent = room.name;
                li.classList.add(
                  "list-none",
                  "hover:translate-x-5",
                  "duration-200",
                  "ease-out",
                  "cursor-pointer",
                  "hover:text-goldOne",
                  "hover:scale-105"
                );
                li.dataset.roomId = room.room_id;
                li.dataset.roomName = room.name;
                roomListContainer.appendChild(li);

                li.addEventListener("click", () => {
                  choosenRooms.textContent = room.name;
                  roomIdInput.value = room.room_id;
                  currentRoomNameInput.value = room.name;
                  roomsMenu.classList.add("hidden");

                  fetchShowtimes(selectedCinemaId, room.room_id);
                });
              });
            } else {
              const noRoomsMessage = document.createElement("p");
              noRoomsMessage.textContent = "Aucune Salle";
              noRoomsMessage.classList.add(
                "text-center",
                "font-arvo",
                "text-white",
                "font-bold",
                "text-3xl",
                "w-fit"
              );
              roomListContainer.appendChild(noRoomsMessage);
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            showError(
              "Une erreur s'est produite lors de la récupération des salles."
            );
          });
      });
    });


    roomsMenuBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const isHidden = roomsMenu.classList.contains("hidden");
      closeAllMenu();
      if (isHidden) {
        roomsMenu.classList.toggle("hidden");
      }
    });


    showtimesMenuBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const isHidden = showtimesMenu.classList.contains("hidden");
      closeAllMenu();
      if (isHidden) {
        showtimesMenu.classList.toggle("hidden");
      }
    });

  
    showtimesList.addEventListener("change", (e) => {
      const selectedOption = showtimesList.options[showtimesList.selectedIndex];
      choosenShowtimes.textContent = selectedOption.textContent;


      const showtimesId = selectedOption.value;
      const movieId = selectedOption.dataset.movieId;
      const movieDuration = selectedOption.dataset.movieDuration;
      selectedMovieId = movieId;
      selectedMovieDuration = parseInt(movieDuration) * 60 * 1000;
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("showtimesId", showtimesId);
      window.history.replaceState({}, "", currentUrl.toString());

      showtimesMenu.classList.add("hidden");
    });

    
    openAlertBtn.addEventListener("click", (e) => {
      e.preventDefault();
      alertMenu.classList.toggle("hidden");
      alertMenu.classList.toggle("flex");
    });

    closeAlertBtn.addEventListener("click", (e) => {
      e.preventDefault();
      alertMenu.classList.toggle("hidden");
      alertMenu.classList.toggle("flex");
    });


    const searchInput = document.getElementById("search-movie-input");
    const movieContent = document.getElementById("movie-content");

    searchInput.addEventListener("input", async () => {
      const query = searchInput.value;

      if (query.length === 0) {
        movieContent.innerHTML = "";
        return;
      }

      try {
        const response = await fetch(`/api/v1/movies/search?query=${query}`);
        const movies = await response.json();

        if (!Array.isArray(movies)) {
          throw new TypeError("Response is not an array");
        }

        movieContent.innerHTML = "";

        movies.forEach((movie) => {
          const movieElement = document.createElement("div");
          movieElement.classList.add(
            "container",
            "space-y-7",
            "flex",
            "flex-col",
            "items-center",
            "justify-center",
            "pt-8"
          );

          movieElement.innerHTML = `
              <div href="" class="h-[30%] w-[50%] md:w-[35%] cursor-pointer movie-item" data-movie-id="${movie.movie_id}" data-movie-duration="${movie.duration}">
                <button>
                  <img src="/uploads/${movie.poster}" class="object-cover" alt="Movie picture">
                </button>
              </div>
              <p class="text-blueOne font-arvo text-sm md:text-lg tracking-wide font-bold text-center">${movie.title}</p>
            `;

          movieContent.appendChild(movieElement);

          movieElement.addEventListener("click", () => {
            const movieItem = movieElement.querySelector(".movie-item");

            
            if (movieItem.classList.contains("border-4", "border-goldOne")) {
              movieItem.classList.remove("border-4", "border-goldOne");
              selectedMovieId = null;
              selectedMovieDuration = 0;
            } else {
             
              document.querySelectorAll(".movie-item").forEach((item) => {
                item.classList.remove("border-4", "border-goldOne");
              });
             
              movieItem.classList.add("border-4", "border-goldOne");
              selectedMovieId = movie.movie_id;
              selectedMovieDuration =
                parseInt(movieItem.dataset.movieDuration) * 60 * 1000;
              console.log(selectedMovieId, selectedMovieDuration);
            }
          });
        });
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    });

    
    const fetchShowtimes = (cinemaId, roomId) => {
      fetch(`/api/v1/getShowtimesByCinemaAndRoom/${cinemaId}/${roomId}`)
        .then((response) => response.json())
        .then((data) => {
          showtimesList.innerHTML = "";
          if (data.length > 0) {
            data.forEach((showtime) => {
              const option = document.createElement("option");
              option.value = showtime.showtimes_id;
              option.dataset.movieId = showtime.movie_id;
              option.dataset.movieDuration = showtime.duration;
              option.textContent = `${showtime.title} - ${formatDate(
                showtime.day
              )} - ${showtime.start_time} à ${showtime.end_time}`;
              showtimesList.appendChild(option);
            });
          } else {
            const noShowtimesMessage = document.createElement("p");
            noShowtimesMessage.textContent = "Aucune séance";
            noShowtimesMessage.classList.add(
              "text-center",
              "font-arvo",
              "text-blueOne",
              "font-bold",
              "text-2xl",
              "w-fit"
            );
            showtimesList.appendChild(noShowtimesMessage);
          }
        })
        .catch((error) => {
          console.error("Error fetching showtimes:", error);
        });
    };

    const formatDate = (dateString) => {
      const options = { year: "numeric", month: "2-digit", day: "2-digit" };
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", options);
    };

    // Variable pour la sélection des séances
    let selectedShowtimes = [];

    submitFormBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      const showtimesId = new URL(window.location.href).searchParams.get(
        "showtimesId"
      );
      if (!showtimesId) {
        alert("Veuillez sélectionner une séance à mettre à jour.");
        return;
      }

      try {
        const response = await fetch(`/api/v1/showtimes/${showtimesId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const result = await response.json();
          localStorage.setItem(
            "success-message",
            "Séance supprimée avec succès."
          );
          window.location.href = "/dashboard/admin/showtimes";
        } else {
          const errorData = await response.json();
          alert(`Erreur: ${errorData.error}`);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Une erreur s'est produite lors de la soumission du formulaire.");
      }
    });

    const openDatetimePickerBtn = document.getElementById(
      "open-datetime-picker"
    );
    const datetimePickerModal = document.getElementById(
      "datetime-picker-modal"
    );
    const addDatetimePickerBtn = document.getElementById("add-datetime-picker");
    const datetimePickerContainer = document.getElementById(
      "datetime-picker-container"
    );
    const closeDatetimePickerBtn = document.getElementById(
      "close-datetime-picker"
    );
    const selectedShowtimesInput =
      document.getElementById("selected-showtimes");

    openDatetimePickerBtn.addEventListener("click", () => {
      datetimePickerModal.classList.remove("hidden");
    });

    closeDatetimePickerBtn.addEventListener("click", () => {
      datetimePickerModal.classList.add("hidden");
    });

    addDatetimePickerBtn.addEventListener("click", () => {
      const datetimePicker = document.createElement("div");
      datetimePicker.classList.add(
        "flex",
        "space-x-4",
        "mb-4",
        "datetime-picker"
      );

      datetimePicker.innerHTML = `
        <input type="date" class="outline-none border border-gray-300 rounded p-2 date-input" required>
        <label for="" class="font-arvo text-blueOne flex items-center">Début:</label>
        <input type="time" class="outline-none border border-gray-300 rounded p-2 time-input" required>
        <label for="" class="font-arvo text-blueOne flex items-center">Fin:</label>
        <input type="time" class="outline-none border border-gray-300 rounded p-2 end-time-input" required readonly>
        <span class="text-redOne error-message hidden">Chevauchement détecté!</span>
        <button type="button" class="remove-datetime-picker text-redOne">Remove</button>
      `;

      datetimePickerContainer.appendChild(datetimePicker);

      const timeInput = datetimePicker.querySelector(".time-input");
      const endTimeInput = datetimePicker.querySelector(".end-time-input");

      timeInput.addEventListener("input", () => {
        updateEndTime(timeInput, endTimeInput);
        validateShowtimes();
      });

      datetimePicker
        .querySelector(".remove-datetime-picker")
        .addEventListener("click", () => {
          datetimePicker.remove();
          validateShowtimes();
        });
    });

    const updateEndTime = (startTimeInput, endTimeInput) => {
      if (!selectedMovieId || selectedMovieDuration === 0) return;

      const startTime = new Date(`1970-01-01T${startTimeInput.value}:00`);
      const endTime = new Date(startTime.getTime() + selectedMovieDuration);

      const endHours = String(endTime.getHours()).padStart(2, "0");
      const endMinutes = String(endTime.getMinutes()).padStart(2, "0");
      endTimeInput.value = `${endHours}:${endMinutes}`;
    };

    const validateShowtimes = () => {
      const datetimePickers = document.querySelectorAll(".datetime-picker");
      const times = [];

      datetimePickers.forEach((picker) => {
        const dateInput = picker.querySelector(".date-input");
        const timeInput = picker.querySelector(".time-input");
        const endTimeInput = picker.querySelector(".end-time-input");

        const date = dateInput.value;
        const startTime = timeInput.value;
        const endTime = endTimeInput.value;
        const errorMessage = picker.querySelector(".error-message");

        if (date && startTime && endTime) {
          const startDateTime = new Date(`${date}T${startTime}:00`);
          const endDateTime = new Date(`${date}T${endTime}:00`);
          const overlap = times.some((t) => {
            const tStart = new Date(t.start);
            const tEnd = new Date(t.end);
            return (
              (startDateTime >= tStart && startDateTime < tEnd) ||
              (endDateTime > tStart && endDateTime <= tEnd) ||
              (startDateTime <= tStart && endDateTime >= tEnd)
            );
          });

          if (overlap) {
            errorMessage.classList.remove("hidden");
            addDatetimePickerBtn.disabled = true;
          } else {
            errorMessage.classList.add("hidden");
            times.push({ start: startDateTime, end: endDateTime });
          }
        }
      });

      if (times.length === datetimePickers.length) {
        addDatetimePickerBtn.disabled = false;
      }
    };

    // Affichage des messages de succès
    const successMessage = localStorage.getItem("success-message");
    const messageContainer = document.getElementById("message");
    const text = document.getElementById("text");

    if (successMessage) {
      text.innerHTML = successMessage;
      messageContainer.classList.remove("hidden");

      setTimeout(() => {
        messageContainer.classList.add("hidden");
        localStorage.removeItem("success-message");
      }, 3000);
    }
  } else {
    document.addEventListener("DOMContentLoaded", () => {
     
      const successMessage = localStorage.getItem("success-message");
      const messageContainer = document.getElementById("message");
      const text = document.getElementById("text");

      if (successMessage) {
        text.innerHTML = successMessage;
        messageContainer.classList.remove("hidden");

        setTimeout(() => {
          messageContainer.classList.add("hidden");
          localStorage.removeItem("success-message");
        }, 3000);
      }
    });
  }
});
