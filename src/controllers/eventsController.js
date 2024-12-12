const { query } = require("../config/db");
const helper = require("../lib/helper");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const getMemberEvents = async (req, res, next) => {
  const token = req?.headers?.authorization?.split(" ")?.[1];
  const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);

  try {
    const { status: filterStatus } = req.query;
    const now = new Date();

    // Query with JOIN to get events and participation info
    const events = await query({
      sql: `
        SELECT 
          e.*, 
          CASE 
            WHEN ep.id IS NOT NULL THEN TRUE 
            ELSE FALSE 
          END AS joined
        FROM events e
        LEFT JOIN events_participation ep 
          ON e.id = ep.event_joined AND ep.user_id = ?
      `,
      values: [decoded?.userId],
    });

    // Add status to events based on start and end datetime
    const results = events.map((event) => {
      const eventStart = new Date(event.event_start_datetime);
      const eventEnd = new Date(event.event_end_datetime);

      let status = "upcoming";
      if (now >= eventStart && now <= eventEnd) {
        status = "ongoing";
      } else if (now > eventEnd) {
        status = "finished";
      }

      return {
        ...event,
        status,
      };
    });

    // Optionally filter by status
    const filteredResults = filterStatus
      ? results.filter((event) => event.status === filterStatus)
      : results;

    // Return the filtered results
    return res.status(200).json(filteredResults);
  } catch (error) {
    console.error("Error fetching member events:", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const addEvent = async (req, res, next) => {
  const {
    name,
    event_location,
    event_start_datetime,
    event_end_datetime,
    allocated_stamps,
  } = req.body;

  const token = req?.headers?.authorization?.split(" ")?.[1];
  const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);

  let eventImage = req.file;

  const eventPath = `/images/events/${eventImage?.filename}`;

  const timestamp = helper.currentTimestamp();

  try {
    const results = await query(
      "INSERT INTO events (name, created_at, created_by, event_location, event_start_datetime, event_end_datetime, allocated_stamps, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        name,
        timestamp,
        decoded?.userId,
        event_location,
        event_start_datetime,
        event_end_datetime,
        allocated_stamps,
        eventPath,
      ]
    );

    return res.status(200).json({
      message: "Event created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const joinEvent = async (req, res, next) => {
  const id = parseInt(req.params.id);

  const token = req?.headers?.authorization?.split(" ")?.[1];
  const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);

  const created_at = helper.currentTimestamp();
  try {
    // Check if the user has already joined the event
    const existingRecord = await query({
      sql: "SELECT * FROM events_participation WHERE event_joined = ? AND user_id = ?",
      values: [id, decoded?.userId],
    });

    if (existingRecord.length > 0) {
      return res.status(400).json({
        message: "You already joined this event.",
      });
    }

    // Insert new participation record
    const results = await query({
      sql: "INSERT INTO events_participation (event_joined, user_id, created_at, status) VALUES (?, ?, ?, ?)",
      values: [id, decoded?.userId, created_at, "partial"],
    });

    return res.status(200).json({
      message: "Successfully joined the event",
    });
  } catch (error) {
    console.error("Error joining event:", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const getEventParticipants = async (req, res, next) => {
  const id = parseInt(req.params.id);
  const searchTerm = req.query.s || "";

  const token = req?.headers?.authorization?.split(" ")?.[1];
  const decoded = jwt.verify(token, process.env.NODE_JWT_SECRET);

  try {
    const results = await query({
      sql: `
        SELECT ep.*, u.email, u.first_name, u.last_name, p.name AS purok_name, e.name AS event_name, e.event_start_datetime, e.event_end_datetime, gc.code AS generated_code
        FROM events_participation ep
        JOIN users u ON ep.user_id = u.id
        JOIN purok p ON u.purok = p.id
        JOIN events e ON ep.event_joined = e.id
        LEFT JOIN generated_codes gc ON ep.event_joined = gc.event_id AND ep.user_id = gc.code_owner
        WHERE ep.event_joined = ? AND (u.first_name LIKE ? OR u.last_name LIKE ?)
      `,
      values: [id, `%${searchTerm}%`, `%${searchTerm}%`],
    });

    const now = new Date();

    const participantsWithStatus = results.map((participant) => {
      const eventStart = new Date(participant.event_start_datetime);
      const eventEnd = new Date(participant.event_end_datetime);

      let event_status = "upcoming";
      if (now >= eventStart && now <= eventEnd) {
        event_status = "ongoing";
      } else if (now > eventEnd) {
        event_status = "finished";
      }

      return {
        ...participant,
        event_status,
      };
    });

    return res.status(200).json(participantsWithStatus);
  } catch (error) {
    console.error("Error fetching event participants:", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const eventAttendanceApproval = async (req, res, next) => {
  const { id, userId } = req.params;

  try {
    const results = await query({
      sql: "UPDATE events_participation SET status = 'attended' WHERE event_joined = ? AND user_id = ?",
      values: [id, userId],
    });

    const checkExistingCode = await query({
      sql: "SELECT * FROM generated_codes WHERE event_id = ? AND code_owner = ?",
      values: [id, userId],
    });

    if (checkExistingCode.length > 0) {
      return res.status(422).json({
        message: "Code already generated for this user.",
      });
    }
    const generatedCode = helper.generateCode();

    const timestamp = helper.currentTimestamp();

    const decoded = jwt.verify(
      req?.headers?.authorization?.split(" ")?.[1],
      process.env.NODE_JWT_SECRET
    );

    const tokenUserId = decoded.userId;
    const insertCode = await query({
      sql: "INSERT INTO generated_codes (event_id, code_owner, created_at, code, status, created_by) VALUES (?, ?, ?, ?, ?, ?)",
      values: [id, userId, timestamp, generatedCode, "pending", tokenUserId],
    });

    return res.status(200).json({
      message: "Code generated successfully.",
      code: generatedCode, // Return the generated code for verification
    });
  } catch (error) {
    console.error("Error validating event attendance approval:", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const getEventStat = async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return res.status(422).json({
      message: "Event ID is required.",
    });
  }

  try {
    const [usersCount] = await query({
      sql: "SELECT COUNT(*) AS total FROM users",
    });

    const [results] = await query({
      sql: `
        SELECT 
          COALESCE(COUNT(CASE WHEN ep.status = 'attended' THEN 1 END), 0) AS final_participants,
          COALESCE(COUNT(CASE WHEN ep.status = 'partial' THEN 1 END), 0) AS partial_participants,
          COALESCE(COUNT(*), 0) AS total_participants,
          COALESCE(COUNT(CASE WHEN u.gender = 1 THEN 1 END), 0) AS male_participants,
          COALESCE(COUNT(CASE WHEN u.gender = 2 THEN 1 END), 0) AS female_participants
        FROM 
          events_participation ep
        JOIN 
          users u ON ep.user_id = u.id
        WHERE 
          ep.event_joined = ?
      `,
      values: [id],
    });

    return res.status(200).json({
      eventInfo: results,
      userCount: usersCount,
    });
  } catch (error) {
    console.error("Error fetching event stats:", error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  getMemberEvents,
  addEvent,
  joinEvent,
  getEventParticipants,
  eventAttendanceApproval,
  getEventStat,
};
