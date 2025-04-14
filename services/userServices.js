import db from "../db/db.js";

export const getUserById = async function (id) {
  try {
    const result = await db.query(
      "SELECT user_id, username, email, roles.name as role FROM users, roles WHERE user_type_id = roles.id AND user_id = $1 LIMIT 1",
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Ошибка при получении пользователя:", error);
    throw error;
  }
};
