const { query } = require("../config/db");
const { getUserByToke, catchError } = require("../lib/helper");

const createBlog = async (req, res) => {
  const { title, body } = req.body;
  const token = req.headers.authorization.split(" ")[1];

  const user = await getUserByToken(token);

  // console.log("user", user);

  try {
    const results = query({
      sql: "INSERT INTO posts (title, body, author_id) VALUES (?, ?, ?)",
      values: [title, body, user?.userId],
    });

    return res.status(200).json({
      message: "Blog created successfully",
      data: results[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const getBlogs = async (req, res) => {
  try {
    const results = await query({
      sql: `
        SELECT posts.*, users.id as author_id, users.email as author_email
        FROM posts
        INNER JOIN users ON posts.author_id = users.id
      `,
    });

    return res.status(200).json({
      message: "Blogs retrieved successfully",
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = { createBlog, getBlogs };
