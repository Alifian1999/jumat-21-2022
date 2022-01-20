//import postgres pool
const {Pool} = require('pg')
// const { port } = require('pg/lib/defaults')

const dbpool = new Pool({
    database: 'personal_web_b30',
    port : 5432,
    user : 'postgres',
    password : 'ip0369751399'
})

module.exports = dbpool