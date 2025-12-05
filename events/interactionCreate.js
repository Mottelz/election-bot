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
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while processing your request!', flags: MessageFlags.Ephemeral });
				}
				else {
					await interaction.reply({ content: 'There was an error while processing your request!', flags: MessageFlags.Ephemeral });
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
	switch (customId) {
		case 'open_ballot':
			await openBallotModal(interaction);
			break;
		default:
			await interaction.reply({ content: 'Unknown button interaction.', flags: MessageFlags.Ephemeral });
	}
}

async function handleModalSubmit(interaction) {
	const { customId } = interaction;

	// Handle different modal submissions based on customId
	switch (customId) {
		case 'ballot_modal':
			await processBallotSubmission(interaction);
			break;
		default:
			await interaction.reply({ content: 'Unknown modal submission.', flags: MessageFlags.Ephemeral });
	}
}




