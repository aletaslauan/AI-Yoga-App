const pool = require('back-end\config\database.js');

const createUser = async (name, email, passwordHash) => {
    const query = 'INSERT INTO Users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *';
    const values = [name, email, passwordHash];
    const res = await pool.query(query, values);
    return res.rows[0];
};

module.exports = {
    createUser,
};

