document.addEventListener("DOMContentLoaded", () => {
  const selectTheaterBtn = document.getElementById("select-theater");
  const openTheaterMenu = document.getElementById("theater-menu");
  const theaterListItems = document.querySelectorAll("#theater-list li");
  const cinemaChoosen = document.getElementById("cinema-choosen");
  const cinemaIdInput = document.getElementById("cinema-id");

  const selectRoomBtn = document.getElementById("select-room");
  const openRoomMenu = document.getElementById("room-menu");
  const roomChoosen = document.getElementById("room-choosen");
  const roomIdInput = document.getElementById("room-id");
  const currentRoomNameInput = document.getElementById("current-room-name");
  const roomListContainer = document.getElementById("room-list");

  const mainField = document.getElementById("main-field");
  const addSeatGroupBtn = document.getElementById("add-seat-group");
  const seatGroupsContainer = document.getElementById("seat-groups");

  const openAlertBtn = document.getElementById("open-alert-btn");
  const alertMenu = document.getElementById("alert");
  const closeAlertBtn = document.getElementById("close-alert");
  const submitFormBtn = document.getElementById("submit-form");

  const errorMessages = document.getElementById("error-messages");

  let selectedCinemaId = null;

  const closeMenu = () => {
    openTheaterMenu.classList.add("hidden");
    openRoomMenu.classList.add("hidden");
  };

  const showError = (message) => {
    const errorMessage = document.createElement("li");
    errorMessage.textContent = message;
    errorMessages.appendChild(errorMessage);
  };

  const clearErrors = () => {
    errorMessages.innerHTML = "";
  };

  const validateInputs = () => {
    const seatLabels = document.querySelectorAll(".seat-label");
    const seatCounts = document.querySelectorAll(".seat-count");
    let allValid = true;
    let labelsSet = new Set();

    clearErrors();

    seatLabels.forEach((label, index) => {
      const normalizedLabel = label.value.trim().toLowerCase();
      if (normalizedLabel === "" || seatCounts[index].value.trim() === "") {
        allValid = false;
      }
      if (labelsSet.has(normalizedLabel)) {
        allValid = false;
        showError("Deux sièges ne peuvent pas avoir le même libellé.");
      }
      labelsSet.add(normalizedLabel);
    });

    addSeatGroupBtn.disabled = !allValid;
  };

  selectTheaterBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const isHidden = openTheaterMenu.classList.contains("hidden");
    closeMenu();
    if (isHidden) {
      openTheaterMenu.classList.toggle("hidden");
    }
  });

  theaterListItems.forEach((item) => {
    item.addEventListener("click", () => {
      selectedCinemaId = item.dataset.cinemaId;
      cinemaChoosen.textContent = item.textContent;
      cinemaIdInput.value = selectedCinemaId;
      openTheaterMenu.classList.add("hidden");
      mainField.classList.remove("hidden");

      // Fetch rooms for the selected cinema
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
                roomChoosen.textContent = room.name;
                roomIdInput.value = room.room_id;
                currentRoomNameInput.value = room.name;
                openRoomMenu.classList.add("hidden");
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

  selectRoomBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const isHidden = openRoomMenu.classList.contains("hidden");
    closeMenu();
    if (isHidden) {
      openRoomMenu.classList.toggle("hidden");
    }
  });

  openAlertBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const currentRoomName = currentRoomNameInput.value || "SALLE";
    document.getElementById("alert-message").textContent =
      `VOULEZ-VOUS VRAIMENT MODIFIER LA SALLE ${currentRoomName} ?`;
    alertMenu.classList.toggle("hidden");
    alertMenu.classList.toggle("flex");
  });

  closeAlertBtn.addEventListener("click", (e) => {
    e.preventDefault();
    alertMenu.classList.toggle("hidden");
    alertMenu.classList.toggle("flex");
  });

  addSeatGroupBtn.addEventListener("click", () => {
    const seatGroup = document.createElement("div");
    seatGroup.classList.add("seat-group", "flex", "items-center", "gap-x-2");

    seatGroup.innerHTML = `
                <input type="text" class="seat-label outline-none w-1/3 h-10 px-2 text-sm placeholder:text-blueOne placeholder:font-arvo placeholder:font-bold" placeholder="LIBELLÉ SIEGE" required>
                <input type="number" class="seat-count outline-none w-1/3 h-10 px-2 text-sm placeholder:text-blueOne placeholder:font-arvo placeholder:font-bold" placeholder="NOMBRE DE SIEGES" min="1" max="24" required>
                <select class="seat-accessibility outline-none w-1/3 h-10 px-2 font-arvo text-blueOne font-bold text-sm" required>
                    <option value="true">Accessibilité: Oui</option>
                    <option value="false">Accessibilité: Non</option>
                </select>
                <button type="button" class="remove-seat-group bg-redOne text-white w-5 h-5 flex items-center justify-center hover:bg-red-600 duration-200 hover:scale-95">-</button>
            `;

    seatGroup
      .querySelector(".remove-seat-group")
      .addEventListener("click", () => {
        seatGroup.remove();
        validateInputs();
      });

    seatGroup
      .querySelector(".seat-label")
      .addEventListener("input", validateInputs);
    seatGroup
      .querySelector(".seat-count")
      .addEventListener("input", validateInputs);

    seatGroupsContainer.appendChild(seatGroup);
    validateInputs();
  });

  document
    .querySelectorAll(".seat-label")
    .forEach((label) => label.addEventListener("input", validateInputs));
  document
    .querySelectorAll(".seat-count")
    .forEach((count) => count.addEventListener("input", validateInputs));

  validateInputs();

  submitFormBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const roomName = document.getElementById("room-name").value;
    const roomQuality = document.getElementById("room-quality").value;
    const seatGroups = Array.from(document.querySelectorAll(".seat-group"));
    const roomId = roomIdInput.value; 

    const seats = seatGroups.map((group) => {
      return {
        seat_label: group.querySelector(".seat-label").value,
        count: group.querySelector(".seat-count").value,
        accessibility: group.querySelector(".seat-accessibility").value,
      };
    });

    try {
      console.log(`Sending request to /api/v1/updateRoomWithSeats/${roomId}`);
      const response = await fetch(`/api/v1/updateRoomWithSeats/${roomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cinema_id: selectedCinemaId,
          name: roomName,
          quality: roomQuality,
          seats,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      window.location.href = data.redirectUrl;
    } catch (error) {
      console.error("Error:", error);
      showError(
        "Une erreur s'est produite lors de la modification de la salle et des sièges."
      );
    }

    alertMenu.classList.toggle("hidden");
    alertMenu.classList.toggle("flex");
  });
});
