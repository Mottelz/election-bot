const { db } = require('./base');

const addCandidate = async ({
	discord_id,
	name,
	ballot_group = 1
}) => {
	// Ensure the ballot group exists
	await createBallotGroup(ballot_group);

	const stmnt = db.prepare("INSERT INTO candidates (discord_id, name, ballot_group) VALUES (@discord_id, @name, @ballot_group)");
	await stmnt.run({ discord_id, name, ballot_group });
};

const getAllCandidates = async () => {
	const stmnt = db.prepare("SELECT * FROM candidates ORDER BY ballot_group, id");
	return await stmnt.all();
};

const getCandidatesByBallotGroup = async (ballotGroup) => {
	const stmnt = db.prepare("SELECT * FROM candidates WHERE ballot_group = @ballotGroup ORDER BY id");
	return await stmnt.all({ ballotGroup });
};

const getBallotGroups = async () => {
	const stmnt = db.prepare("SELECT DISTINCT ballot_group FROM candidates ORDER BY ballot_group");
	return await stmnt.all();
};

const createBallotGroup = async (ballotGroup) => {
	const stmnt = db.prepare("INSERT OR IGNORE INTO ballot_groups (id, name) VALUES (@ballotGroup, @name)");
	await stmnt.run({ ballotGroup, name: `Ballot Group ${ballotGroup}` });
};

const assignCandidatesToBallotGroups = async () => {
	const candidates = await getAllCandidates();
	const groupSize = 5;

	// Reset all candidates to group 1 first
	const resetStmnt = db.prepare("UPDATE candidates SET ballot_group = 1");
	await resetStmnt.run();

	// Calculate how many groups we'll need
	const numGroups = Math.ceil(candidates.length / groupSize);

	// Ensure ballot group records exist
	for (let groupId = 1; groupId <= numGroups; groupId++) {
		await createBallotGroup(groupId);
	}

	// Reassign candidates to groups of 5
	for (let i = 0; i < candidates.length; i++) {
		const ballotGroup = Math.floor(i / groupSize) + 1;
		const updateStmnt = db.prepare("UPDATE candidates SET ballot_group = @ballotGroup WHERE discord_id = @discord_id");
		await updateStmnt.run({ ballotGroup, discord_id: candidates[i].discord_id });
	}
}; module.exports = {
	addCandidate,
	getAllCandidates,
	getCandidatesByBallotGroup,
	getBallotGroups,
	assignCandidatesToBallotGroups,
	createBallotGroup
}