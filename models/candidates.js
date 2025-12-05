const { db } = require('./base');

const addCandidate = async ({
	discord_id,
	name
}) => {
	const stmnt = "INSERT INTO candidates (discord_id, name) VALUES (?, ?)";
	await db.run(stmnt, [discord_id, name]);
};

const getAllCandidates = async () => {
	const stmnt = "SELECT * FROM candidates";
	return await db.all(stmnt);
};

module.exports = {
	addCandidate,
	getAllCandidates
}