const mysql = require('mysql2/promise')
const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: process.env.DB_USER || 'mario',
    password: process.env.DB_PASSWORD || 'q1w2e3r4',
    database: 'botworker',
    connectionLimit: 4,
    timezone: '+08:00'
})

const mkQuery = (sql, pool) => {
    console.log(sql)
    return async (args) => {
        const conn = await pool.getConnection()
        try {
            let results = await conn.query(sql, args || [])
            return results[0] //index 0 is data, index 1 is metadata
        }catch(e){
            console.error('ERROR: ', e)
        }finally {
            conn.release()
        }
    }
}

module.exports = { pool, mkQuery }
