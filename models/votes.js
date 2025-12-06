const { db } = require('./base');

const addVote = async ({ type, candidateId, ballotGroup, voter }) => {
	const stmnt = db.prepare("INSERT INTO votes (type, candidate, ballot_group, voter) VALUES (@type, @candidateId, @ballotGroup, @voter)");
	await stmnt.run({ type, candidateId, ballotGroup, voter });
};

const getAllCountsVotesByTypeAndCandidate = async () => {
	const stmnt = db.prepare(`
		SELECT v.type, v.candidate, v.ballot_group, c.name as candidate_name, COUNT(*) as count 
		FROM votes v 
		LEFT JOIN candidates c ON v.candidate = c.discord_id 
		GROUP BY v.type, v.candidate, v.ballot_group 
		ORDER BY v.ballot_group, c.name, v.type
	`);
	return await stmnt.all();
}

const getCountOfVotesByTypeAndCandidate = async ({ type, candidateId, ballotGroup }) => {
	const stmnt = db.prepare("SELECT COUNT(*) as count FROM votes WHERE type = @type AND candidate = @candidateId AND ballot_group = @ballotGroup");
	const res = await stmnt.get({ type, candidateId, ballotGroup });
	return res.count;
}

module.exports = {
	addVote,
	getCountOfVotesByTypeAndCandidate,
	getAllCountsVotesByTypeAndCandidate,
}