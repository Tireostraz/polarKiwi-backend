import db from "../db/db.js";

export const getUserById = async function (id) {
  try {
    const result = await db.query(
      "SELECT user_id, firstname, lastname, email FROM users WHERE user_id = $1",
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Ошибка при получении пользователя:", error);
    throw error;
  }
};
