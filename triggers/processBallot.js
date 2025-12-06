const { MessageFlags } = require('discord.js');
const { getCandidatesByBallotGroup } = require('../models/candidates');
const { addVote } = require('../models/votes');
const { addBallot, checkBallotExists } = require('../models/ballots');

async function processBallotSubmission(interaction, ballotGroup = 1) {
	// Check if user has already voted for this ballot group
	const hasVoted = await checkBallotExists({ discordId: interaction.user.id, ballotGroup });
	if (hasVoted) {
		await interaction.reply({
			content: `❌ **You have already voted for Ballot ${ballotGroup}!** Each user can only vote once per ballot.`,
			flags: MessageFlags.Ephemeral
		});
		return;
	}

	const candidates = await getCandidatesByBallotGroup(ballotGroup);
	const votes = {};
	const invalidVotes = [];

	// Process each candidate's vote
	for (const candidate of candidates) {
		const voteValue = interaction.fields.getTextInputValue(`vote_${candidate.discord_id}`);
		const normalizedVote = voteValue.toLowerCase().trim();

		// Validate vote value
		if (!['yes', 'no', 'abstain'].includes(normalizedVote)) {
			invalidVotes.push(`${candidate.name}: "${voteValue}" (must be yes, no, or abstain)`);
		} else {
			votes[candidate.name] = normalizedVote;
		}
	}

	// If there are invalid votes, send error message
	if (invalidVotes.length > 0) {
		await interaction.reply({
			content: `❌ **Invalid votes detected:**\n${invalidVotes.join('\n')}\n\nPlease use only: yes, no, or abstain`,
			flags: MessageFlags.Ephemeral
		});
		return;
	}

	// If all votes are valid, proceed with processing
	for (const candidate of candidates) {
		await addVote({
			candidateId: candidate.discord_id,
			type: votes[candidate.name],
			ballotGroup: ballotGroup,
			voter: interaction.user.id
		});
	}

	await addBallot({
		discordId: interaction.user.id,
		ballotGroup: ballotGroup
	});

	// Format the response message
	let responseMessage = `✅ **Thank you for voting on Ballot ${ballotGroup}!** Your votes have been recorded:\n\n`;

	for (const [candidateName, vote] of Object.entries(votes)) {
		const emoji = vote === 'yes' ? '✅' : vote === 'no' ? '❌' : '⚪';
		responseMessage += `${emoji} **${candidateName}**: ${vote}\n`;
	}

	await interaction.reply({
		content: responseMessage,
		flags: MessageFlags.Ephemeral
	});
}

module.exports = {
	processBallotSubmission
};