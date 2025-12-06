const { Events, MessageFlags } = require('discord.js');
const { openBallotModal } = require('../triggers/openBallot');
const { processBallotSubmission } = require('../triggers/processBallot');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		// Handle slash commands
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);
			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}
			try {
				await command.execute(interaction);
			}
			catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
				}
				else {
					await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
				}
			}
		}
		// Handle button interactions (for opening modals)
		else if (interaction.isButton()) {
			try {
				await handleButtonInteraction(interaction);
			}
			catch (error) {
				console.error('Error handling button interaction:', error);
				// Only try to respond if we haven't already responded and it's not an "Unknown interaction" error
				if (!interaction.replied && !interaction.deferred && error.code !== 10062) {
					try {
						await interaction.reply({ content: 'There was an error while processing your request!', flags: MessageFlags.Ephemeral });
					} catch (replyError) {
						console.error('Error sending error reply:', replyError);
					}
				}
			}
		}
		// Handle modal submissions
		else if (interaction.isModalSubmit()) {
			try {
				await handleModalSubmit(interaction);
			}
			catch (error) {
				console.error('Error handling modal submission:', error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while processing your submission!', flags: MessageFlags.Ephemeral });
				}
				else {
					await interaction.reply({ content: 'There was an error while processing your submission!', flags: MessageFlags.Ephemeral });
				}
			}
		}
	},
};

async function handleButtonInteraction(interaction) {
	const { customId } = interaction;

	// Handle different button interactions based on customId
	if (customId === 'open_ballot') {
		// Legacy single ballot support
		await openBallotModal(interaction, 1);
	} else if (customId.startsWith('open_ballot_')) {
		// New multi-ballot support: open_ballot_1, open_ballot_2, etc.
		const ballotGroup = parseInt(customId.split('_')[2]);
		await openBallotModal(interaction, ballotGroup);
	} else {
		await interaction.reply({ content: 'Unknown button interaction.', flags: MessageFlags.Ephemeral });
	}
}

async function handleModalSubmit(interaction) {
	const { customId } = interaction;

	// Handle different modal submissions based on customId
	if (customId === 'ballot_modal') {
		// Legacy single ballot support
		await processBallotSubmission(interaction, 1);
	} else if (customId.startsWith('ballot_modal_')) {
		// New multi-ballot support: ballot_modal_1, ballot_modal_2, etc.
		const ballotGroup = parseInt(customId.split('_')[2]);
		await processBallotSubmission(interaction, ballotGroup);
	} else {
		await interaction.reply({ content: 'Unknown modal submission.', flags: MessageFlags.Ephemeral });
	}
}




