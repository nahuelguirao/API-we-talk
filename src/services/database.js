const { Pool } = require('pg')

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432
})

async function checkDatabaseConnection() {
    try {
        const client = await pool.connect();
        console.log('Conexión exitosa a la base de datos');
        client.release();
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
    }
}

module.exports = { pool, checkDatabaseConnection }