const { db } = require('./base');

const addBallot = async ({ discordId, ballotGroup }) => {
	const stmnt = db.prepare("INSERT INTO ballots (voter, ballot_group) VALUES (@discordId, @ballotGroup)");
	await stmnt.run({ discordId, ballotGroup });
};

const checkBallotExists = async ({ discordId, ballotGroup }) => {
	const stmnt = db.prepare("SELECT COUNT(*) as count FROM ballots WHERE voter = @discordId AND ballot_group = @ballotGroup");
	const res = await stmnt.get({ discordId, ballotGroup });
	return res.count > 0;
};

const getUserSubmittedBallots = async ({ discordId }) => {
	const stmnt = db.prepare("SELECT ballot_group FROM ballots WHERE voter = @discordId");
	return await stmnt.all({ discordId });
};

const countBallots = async () => {
	const stmnt = db.prepare("SELECT COUNT(*) as count FROM ballots");
	const res = await stmnt.get();
	return res.count;
};

const countBallotsByGroup = async (ballotGroup) => {
	const stmnt = db.prepare("SELECT COUNT(*) as count FROM ballots WHERE ballot_group = @ballotGroup");
	const res = await stmnt.get({ ballotGroup });
	return res.count;
};

module.exports = {
	addBallot,
	countBallots,
	checkBallotExists,
	getUserSubmittedBallots,
	countBallotsByGroup,
}