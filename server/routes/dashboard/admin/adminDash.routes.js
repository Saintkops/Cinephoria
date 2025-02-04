const express = require("express");
const adminDashboardRoutes = express.Router();
const {
  checkAuthenticated,
  checkRole,
} = require("../../../middlewares/autorisation/autorisation");
const {
  enrichUserWithInfo,
} = require("../../../middlewares/enrichUserWithInfo");

const {
  getMovieById,
} = require("../../../controllers/movies/movies.controllers");

const {
  getCinemas,
} = require("../../../controllers/cinemas/cinemas.controllers");

const {
  getUsers,
  getUserById,
} = require("../../../controllers/users/users.controllers");
const db = require('../../../config/postgres.config')

const { getRooms } = require("../../../controllers/rooms/rooms.controllers");

const Reservation = require("../../../models/reservationStats.mongo");

//admin dashboard homePage routes
adminDashboardRoutes.get(
  "/",
  checkAuthenticated,
  checkRole("admin"),
  enrichUserWithInfo,
  async (req, res) => {
    try {
      const user = req.user.details;
      const reservations = await Reservation.find({}).lean();

      console.log('Fetched reservations:', reservations);

      const movieIds = [...new Set(reservations.map(res => res.movieId))];
      const movieQuery = `SELECT movie_id, title FROM movies WHERE movie_id = ANY($1::int[])`;
      const { rows: movies } = await db.query(movieQuery, [movieIds]);
      const movieMap = movies.reduce((acc, movie) => {
        acc[movie.movie_id] = movie.title;
        return acc;
      }, {});

      const aggregatedReservations = reservations.reduce((acc, cur) => {
        if (!acc[cur.movieId]) {
          acc[cur.movieId] = {
            movieId: cur.movieId,
            title: movieMap[cur.movieId],
            count: 0
          };
        }
        acc[cur.movieId].count += cur.count;
        return acc;
      }, {});

      const totalReservations = reservations.reduce((acc, cur) => acc + cur.count, 0);
      const today = new Date().toISOString().split('T')[0];
      console.log('Today\'s date:', today);
      const newReservations = reservations.filter(res => {
        const reservationDate = res.date.toISOString().split('T')[0];
        console.log('Reservation date:', reservationDate);
        return reservationDate === today;
      }).reduce((acc, cur) => acc + cur.count, 0);

      console.log('Total reservations:', totalReservations);
      console.log('New reservations:', newReservations);

      res.render("dashboard/admin/admin", {
        title: `Bienvenue ${user.first_name}.`,
        user,
        reservations: Object.values(aggregatedReservations),
        totalReservations,
        newReservations,
      });
    } catch (err) {
      console.error('Error fetching reservations from MongoDB or movies from PostgreSQL:', err);
      res.status(500).send('Internal server error');
    }
  }
);

//admin dashboard films layouts routes
adminDashboardRoutes.get(
  "/films",
  checkAuthenticated,
  checkRole("admin"),
  enrichUserWithInfo,
  (req, res) => {
    res.render("dashboard/admin/films", {
      title: `Modifier ou ajouter des films à l'affiche.`,
    });
  }
);

//admin dashboard add films layouts routes
adminDashboardRoutes.get(
  "/films/add",
  checkAuthenticated,
  checkRole("admin"),
  enrichUserWithInfo,
  (req, res) => {
    res.render("dashboard/admin/addMovie", {
      title: `Ajouter un films.`,
    });
  }
);

//admin dashboard update films layouts routes
adminDashboardRoutes.get(
  "/films/select-update",
  checkAuthenticated,
  checkRole("admin"),
  enrichUserWithInfo,
  (req, res) => {
    res.render("dashboard/admin/selectUpdateMovie", {
      title: `Séléctionner un film à modifer.`,
    });
  }
);

//admin dashboard update films layouts routes
adminDashboardRoutes.get(
  "/films/update/:id",
  checkAuthenticated,
  checkRole("admin"),
  enrichUserWithInfo,
  async (req, res) => {
    const movie = await getMovieById(req, res);
    res.render("dashboard/admin/updateMovie", {
      title: `Modifier le film.`,
      movie: movie
    });
  }
);

//admin dashboard delete films layouts routes
adminDashboardRoutes.get(
  "/films/delete-selection",
  checkAuthenticated,
  checkRole("admin"),
  enrichUserWithInfo,
  (req, res) => {
    res.render("dashboard/admin/deleteMovieSelection", {
      title: `Choisir le films a Supprimer.`,
    });
  }
);

//admin dashboard rooms layouts routes
adminDashboardRoutes.get(
  "/rooms",
  checkAuthenticated,
  checkRole("admin"),
  enrichUserWithInfo,
  (req, res) => {
    res.render("dashboard/admin/rooms", {
      title: `Modifier ou ajouter des salle dans vos cinémas.`,
    });
  }
);

//admin dashboard add rooms layouts routes
adminDashboardRoutes.get(
  "/rooms/add",
  checkAuthenticated,
  checkRole("admin"),
  enrichUserWithInfo,
  async (req, res) => {
    try {
      const cinemas = await getCinemas(req, res);
      res.render("dashboard/admin/addRooms", {
        title: `Ajouter une salle à votre cinéma.`,
        cinemas: cinemas,
      });
    } catch (err) {
      console.log(err);
      const cinemas = await getCinemas(req, res);
      res.render("dashboard/admin/addRooms", {
        title: `Ajouter une salle à votre cinéma.`,
        cinemas: cinemas || [],
      });
    }
  }
);

//admin dashboard  update rooms layouts routes
adminDashboardRoutes.get(
  "/rooms/update",
  checkAuthenticated,
  checkRole("admin"),
  enrichUserWithInfo,
  async (req, res) => {
    const cinemas = await getCinemas(req, res);
    const rooms = await getRooms(req, res);
    res.render("dashboard/admin/updateRooms", {
      title: `Séléctionner une salle et à modifier la salle dans votre cinéma.`,
      cinemas: cinemas,
      rooms: rooms,
    });
  }
);

//admin dashboard  delete rooms layouts routes
adminDashboardRoutes.get(
  "/rooms/delete",
  checkAuthenticated,
  checkRole("admin"),
  enrichUserWithInfo,
  async (req, res) => {
    const cinemas = await getCinemas(req, res);
    const rooms = await getRooms(req, res);
    try {
      res.render("dashboard/admin/deleteRooms", {
        title: `Séléctionner une salle à supprimer dans votre cinéma.`,
        cinemas: cinemas,
        rooms: rooms,
      });
    } catch (err) {
      console.log(err);
      res.render("dashboard/admin/deleteRooms", {
        title: `Séléctionner une salle à supprimer dans votre cinéma.`,
        cinemas: cinemas || [],
        rooms: rooms || [],
      });
    }
  }
);

//admin dashboard employee layouts routes
adminDashboardRoutes.get(
  "/employees",
  checkAuthenticated,
  checkRole("admin"),
  enrichUserWithInfo,
  (req, res) => {
    res.render("dashboard/admin/employees", {
      title: `Modifier ou ajouter des films à l'affiche.`,
    });
  }
);

//admin dashboard add employee layouts routes
adminDashboardRoutes.get(
  "/employees/add",
  checkAuthenticated,
  checkRole("admin"),
  enrichUserWithInfo,
  (req, res) => {
    res.render("dashboard/admin/addEmployees", {
      title: `Ajouter des employées entreprises.`,
    });
  }
);

//admin dashboard select update employee layouts routes
adminDashboardRoutes.get(
  "/employees/update",
  checkAuthenticated,
  checkRole("admin"),
  enrichUserWithInfo,
  async (req, res) => {
    const cinemas = await getCinemas(req, res);
    const users = await getUsers(req, res);
    const employees = users.filter((user) => user.role === "employee");
    res.render("dashboard/admin/selectUpdateEmployees", {
      title: `Modifier le compte de votre employé.`,
      cinemas: cinemas,
      employees: employees,
    });
  }
);

//admin dashboard update employee layouts routes
adminDashboardRoutes.get(
  "/employees/updateEmployee/:id",
  checkAuthenticated,
  checkRole("admin"),
  enrichUserWithInfo,
  async (req, res) => {
    const users = await getUserById(req, res);
    res.render("dashboard/admin/updateEmployees", {
      title: `Modifier le compte de votre employé.`,
      users: users,
    });
  }
);

//admin dashboard select delete employee layouts routes
adminDashboardRoutes.get(
  "/employees/delete",
  checkAuthenticated,
  checkRole("admin"),
  enrichUserWithInfo,
  async (req, res) => {
    try {
      const cinemas = await getCinemas(req, res);
      const users = await getUsers(req, res);
      const employees = users.filter((user) => user.role === "employee");

      res.render("dashboard/admin/selectDelete", {
        title: "Supprimer le compte de votre employé.",
        employees: employees,
        cinemas: cinemas,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

//admin dashboard showtimes layouts routes
adminDashboardRoutes.get(
  "/showtimes",
  checkAuthenticated,
  checkRole("admin"),
  enrichUserWithInfo,
  (req, res) => {
    res.render("dashboard/admin/showtimes", {
      title: `Modifier ou ajouter des scéances dans vos cinémas.`,
    });
  }
);

//admin dashboard showtimes select movie layouts routes
adminDashboardRoutes.get(
  "/showtimes/select-movies",
  checkAuthenticated,
  checkRole("admin"),
  enrichUserWithInfo,
  async (req, res) => {
    try {
      const cinemas = await getCinemas(req, res);
      const rooms = await getRooms(req, res);
      res.render("dashboard/admin/selectMovie", {
        title: `Choisir quel films projeter.`,
        cinemas: cinemas,
        rooms: rooms,
      });
    } catch (err) {
      console.log(err);
      res.render("dashboard/admin/selectMovie", {
        title: `Choisir quel films projeter.`,
        cinemas: cinemas || [],
        rooms: rooms || [],
      });
    }
  }
);

//admin dashboard add showtimes  layouts routes
adminDashboardRoutes.get(
  "/showtimes/add",
  checkAuthenticated,
  checkRole("admin"),
  enrichUserWithInfo,
  (req, res) => {
    res.render("dashboard/admin/addShowtimes", {
      title: `Ajouter une scéance à projeter.`,
    });
  }
);

//admin dashboard update showtimes  layouts routes
adminDashboardRoutes.get(
  "/showtimes/update",
  checkAuthenticated,
  checkRole("admin"),
  enrichUserWithInfo,
  async (req, res) => {
    try {
      const cinemas = await getCinemas(req, res);
      const rooms = await getRooms(req, res);
      res.render("dashboard/admin/updateShowtimes", {
        title: `Modifier une séance.`,
        cinemas: cinemas,
        rooms: rooms,
      });
    } catch (err) {
      console.log(err);
      res.render("dashboard/admin/updateShowtimes", {
        title: `Modifier une séance.`,
        cinemas: cinemas || [],
        rooms: rooms || [],
      });
    }
  }
);

//admin dashboard update showtimes  layouts routes
adminDashboardRoutes.get(
  "/showtimes/delete",
  checkAuthenticated,
  checkRole("admin"),
  enrichUserWithInfo,
  async (req, res) => {
    try {
      const cinemas = await getCinemas(req, res);
      const rooms = await getRooms(req, res);
      res.render("dashboard/admin/deleteShowtimes", {
        title: `Supprimer une scéance.`,
        cinemas: cinemas,
        rooms: rooms,
      });
    } catch (err) {
      console.log(err);
      res.render("dashboard/admin/updateShowtimes", {
        title: `Supprimer une séance.`,
        cinemas: cinemas || [],
        rooms: rooms || [],
      });
    }
  }
);

//admin dashboard assign employee  layouts routes
adminDashboardRoutes.get(
  "/employees/assign",
  checkAuthenticated,
  checkRole("admin"),
  enrichUserWithInfo,
  async (req, res) => {
    const cinemas = await getCinemas(req, res);
    const users = await getUsers(req, res);
    const employees = users.filter((user) => user.role === "employee");
    res.render("dashboard/admin/assign", {
      title: `Assigner un employer à un cinémas.`,
      cinemas: cinemas || [],
      employees: employees || [],
    });
  }
);

module.exports = adminDashboardRoutes;
