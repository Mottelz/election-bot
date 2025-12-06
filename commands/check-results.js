const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder } = require('discord.js');
const { getAllCountsVotesByTypeAndCandidate } = require('../models/votes');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('check-results')
		.setDescription('Checks the results of the current poll.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		try {
			const results = await getAllCountsVotesByTypeAndCandidate();
			if (!results || results.length === 0) {
				return await interaction.reply({ content: 'No votes found for the current poll.' });
			}

			// Group results by ballot group
			const ballotGroups = {};
			results.forEach(result => {
				const ballotGroup = result.ballot_group;
				if (!ballotGroups[ballotGroup]) {
					ballotGroups[ballotGroup] = {};
				}
				if (!ballotGroups[ballotGroup][result.candidate_name]) {
					ballotGroups[ballotGroup][result.candidate_name] = {};
				}
				ballotGroups[ballotGroup][result.candidate_name][result.type] = result.count;
			});

			const embed = new EmbedBuilder()
				.setTitle('📊 **Election Results**')
				.setColor('#e74c3c')
				.setTimestamp();

			// Format results by ballot group
			for (const [ballotGroup, candidates] of Object.entries(ballotGroups)) {
				let fieldValue = '';
				for (const [candidateName, votes] of Object.entries(candidates)) {
					const yes = votes.yes || 0;
					const no = votes.no || 0;
					const abstain = votes.abstain || 0;
					fieldValue += `**${candidateName}**\n`;
					fieldValue += `✅ Yes: ${yes} | ❌ No: ${no} | ⚪ Abstain: ${abstain}\n\n`;
				}

				embed.addFields({
					name: `🗳️ Ballot ${ballotGroup}`,
					value: fieldValue || 'No votes recorded',
					inline: false
				});
			}

			return await interaction.reply({ embeds: [embed] });
		} catch (error) {
			console.error('Error checking poll results:', error);
			return await interaction.reply({ content: '❌ **Error checking poll results!** Please try again later.', flags: MessageFlags.Ephemeral });
		}
	}
}