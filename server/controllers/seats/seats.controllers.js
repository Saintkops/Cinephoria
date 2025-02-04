// Import the database configuration
const DB = require("../../config/postgres.config");

// Functions to get all seats
async function getSeats(req, res) {
  try {
    const query = "SELECT * FROM seats";
    const results = await DB.query(query);

    if (results.rows.length <= 0) {
      res.status(404).json("No seats found !");
      return;
    }

    res.status(200).json(results.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json("Internal server error !");
  }
}

// Function to get a seat by ID
async function getSeatsById(req, res) {
  try {
    const id = req.params.id;
    const query = "SELECT * FROM seats WHERE seat_id = $1";
    const results = await DB.query(query, [id]);

    if (results.rows.length <= 0) {
      res.status(404).json({message:"No seat id found !"});
      return;
    }

    res.status(200).json(results.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json("Internal server error !");
  }
}

async function getSeatsByRoomId(roomId) {
  const query = "SELECT * FROM seats WHERE room_id = $1";
  const parameter = [roomId];
  const result = await DB.query(query, parameter); 
  return result.rows;
}

async function getSeatsByRoomIdApi(req, res) {
  const id = req.params.id
  const query = "SELECT * FROM seats WHERE room_id = $1";
  const parameter = [id];
  const results = await DB.query(query, parameter); 
  return res.status(200).json(results.rows);
}

async function getRoomsSeatsByCinemaId(req, res) {
  const id = req.params.id;
  const query = `
  SELECT 
    s.seat_id, s.seat_label, s.accessibility,
    r.room_id, r.name AS room_name, r.quality,
    c.cinema_id, c.name AS cinema_name
  FROM
    seats s
  JOIN 
    rooms r ON s.room_id = r.room_id
  JOIN
    cinemas c ON r.cinema_id = c.cinema_id
  WHERE
    c.cinema_id = $1 
  `;
  const parameter = [id];
  try {
    const result = await DB.query(query, parameter);
    const isElectronRequest = req.headers['x-electron-request'] === 'true';
    if (isElectronRequest) {
      return res.status(200).json(result.rows);
    } else {
      return result.rows;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des salles et sièges par ID de cinéma :", error);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
}

async function getSeatCountByRoomId(roomId) {
  try {
    const query = `
        SELECT COUNT(*) AS total_seats
        FROM seats
        WHERE room_id = $1;
    `;
    const parameter = [roomId];
    const result = await DB.query(query, parameter);
    const totalSeats = result.rows[0].total_seats;

    return  totalSeats;
} catch (error) {
    console.error(error);
}
}

async function getReservedSeats(showtimesId) {
  try {
      const query = `
          SELECT seats_reserved 
          FROM reservations 
          WHERE showtimes_id = $1 AND status = false;`;
      const result = await DB.query(query, [showtimesId]);
      let reservedSeats = [];
      result.rows.forEach(row => {
          reservedSeats = reservedSeats.concat(row.seats_reserved);
      });
      console.log("Sièges réservés depuis la base de données :", reservedSeats); 
      return reservedSeats;
  } catch (error) {
      console.error(error);
      return [];
  }
}



// Function to create a new seat
async function postSeats(req, res) {
  try {
    const {
      room_id,
      seat_label,
      accessibility
    } = req.body;


    if (
      !room_id ||
      !seat_label ||
      !accessibility
    ) {
      return res
        .status(400)
        .json({ error: "You must enter all required fields!" });
    }

    const query =
      "INSERT INTO seats (room_id, seat_label, accessibility) VALUES ($1, $2, $3) RETURNING *";
    const result = await DB.query(query, [
      room_id,
      seat_label,
      accessibility
    ]);


    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error!" });
  }
};

// Function to update a seat by ID
async function updateSeatsById(req, res) {
  try {
    const id = req.params.id;
    const {
      room_id,
      seat_label,
      accessibility
    } = req.body;

    const query =
      "UPDATE seats SET room_id = $1, seat_label = $2, accessibility = $3 WHERE seat_id = $4";
    const result = await DB.query(query, [
      room_id,
      seat_label,
      accessibility,
      id,
    ]);
 
    return res.status(200).json({ message: "Seat updated successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error!" });
  }
}

// Function to delete a seat by ID
async function deleteSeatsById(req, res) {
  try {
    const id = req.params.id;
    const foundSeatsQuery = "SELECT * FROM seats WHERE seat_id = $1";
    const seat = await DB.query(foundSeatsQuery, [id]);
     // Check if the seat with the given ID is found
    if (seat.rows.length !== 0) {
      const query = "DELETE FROM seats WHERE seat_id = $1";
      await DB.query(query, [id]);
      // Send a success message as response
      return res.status(200).json({message:"seat deleted successfully"});
    } else {
      return res.status(404).json({message:"No seat found !"});
    }
  } catch (err) {
    console.log(err);
    res.status(500).json("Internal server error !");
  }
}

// Export the functions as a module
module.exports = {
    getSeats,
    getSeatsById,
    getSeatsByRoomIdApi,
    getReservedSeats,
    getRoomsSeatsByCinemaId,
    getSeatCountByRoomId,
    getSeatsByRoomId,
    postSeats,
    deleteSeatsById,
    updateSeatsById,
};