const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } = require('discord.js');
const { getCandidatesByBallotGroup } = require('../models/candidates');

async function openBallotModal(interaction, ballotGroup = 1) {
	try {
		const modal = new ModalBuilder()
			.setCustomId(`ballot_modal_${ballotGroup}`)
			.setTitle(`Submit Your Vote - Ballot ${ballotGroup}`);

		const candidates = await getCandidatesByBallotGroup(ballotGroup);

		// Check if there are any candidates in this ballot group
		if (!candidates || candidates.length === 0) {
			await interaction.reply({
				content: `❌ **No candidates found in Ballot ${ballotGroup}!**`,
				flags: MessageFlags.Ephemeral
			});
			return;
		}

		// Create action rows with text input fields for each candidate
		const actionRows = candidates.map(candidate => {
			const voteInput = new TextInputBuilder()
				.setCustomId(`vote_${candidate.discord_id}`)
				.setLabel(`Vote for ${candidate.name}?`)
				.setStyle(TextInputStyle.Short)
				.setPlaceholder('Enter: yes, no, or abstain')
				.setRequired(true)
				.setMaxLength(7); // "abstain" is 7 characters

			return new ActionRowBuilder().addComponents(voteInput);
		});

		// Add some debugging
		console.log(`Creating modal for ballot group ${ballotGroup} with ${actionRows.length} action rows for ${candidates.length} candidates`);

		modal.setComponents(...actionRows);

		await interaction.showModal(modal);
	} catch (error) {
		console.error('Error in openBallotModal:', error);
		// Only try to reply if we haven't already responded
		if (!interaction.replied && !interaction.deferred) {
			try {
				await interaction.reply({
					content: '❌ **Error opening ballot!** Please try again later.',
					flags: MessageFlags.Ephemeral
				});
			} catch (replyError) {
				console.error('Error sending error reply:', replyError);
			}
		}
		throw error; // Re-throw so the main error handler knows about it
	}
}

module.exports = {
	openBallotModal
};