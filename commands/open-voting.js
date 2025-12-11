const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags } = require('discord.js');
const { assignCandidatesToBallotGroups, getBallotGroups, getCandidatesByBallotGroup } = require('../models/candidates');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('open-voting')
		.setDescription('Opens voting for the current poll.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		try {
			// First, reorganize candidates into ballot groups of 5
			await assignCandidatesToBallotGroups();

			// Get all ballot groups
			const ballotGroups = await getBallotGroups();

			if (!ballotGroups || ballotGroups.length === 0) {
				await interaction.reply({
					content: '❌ **No candidates found!** Please add candidates before opening voting.',
					ephemeral: true
				});
				return;
			}

			// Create embed with voting instructions
			const embed = new EmbedBuilder()
				.setTitle('🗳️ **Voting is Now Open!**')
				.setDescription('Click the buttons below to vote for each ballot group. You can vote for multiple ballot groups, but only once per group.')
				.setColor('#2ecc71')
				.setTimestamp();

			// Add field for each ballot group showing candidates
			for (const group of ballotGroups) {
				const candidates = await getCandidatesByBallotGroup(group.ballot_group);
				const candidateNames = candidates.map(c => c.name).join('\n');
				embed.addFields({
					name: `Ballot ${group.ballot_group}`,
					value: candidateNames || 'No candidates',
					inline: true
				});
			}

			// Create button rows (max 5 buttons per row)
			const buttonRows = [];
			let currentRow = new ActionRowBuilder();

			for (let i = 0; i < ballotGroups.length; i++) {
				const group = ballotGroups[i];
				const button = new ButtonBuilder()
					.setCustomId(`open_ballot_${group.ballot_group}`)
					.setLabel(`Vote Ballot ${group.ballot_group}`)
					.setStyle(ButtonStyle.Primary)
					.setEmoji('🗳️');

				currentRow.addComponents(button);

				// If we have 5 buttons or we're at the last group, push the row
				if (currentRow.components.length === 5 || i === ballotGroups.length - 1) {
					buttonRows.push(currentRow);
					currentRow = new ActionRowBuilder();
				}
			}

			await interaction.reply({
				embeds: [embed],
				components: buttonRows
			});

		} catch (error) {
			console.error('Error opening voting:', error);
			await interaction.reply({
				content: '❌ **Error opening voting!** Please try again later.',
				flags: MessageFlags.Ephemeral
			});
		}
	}
};