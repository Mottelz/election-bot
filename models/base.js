const path = require('path');
const db = require('better-sqlite3')(path.join(__dirname, process.env.DB_PATH || 'elections.db'), {});

module.exports = {
	db,
};
