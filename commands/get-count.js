const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder } = require('discord.js');
const { countBallotsByGroup } = require('../models/ballots');
const { getBallotGroups, getCandidatesByBallotGroup } = require('../models/candidates');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('get-count')
		.setDescription('Gets the count of votes submitted for each ballot group.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		try {
			const ballotGroups = await getBallotGroups();
			if (!ballotGroups || ballotGroups.length === 0) {
				return await interaction.reply({ content: 'No ballot groups found.' });
			}

			const embed = new EmbedBuilder()
				.setTitle('📊 **Ballot Counts**')
				.setColor('#a524bf')
				.setTimestamp();

			// Process each ballot group
			for (const group of ballotGroups) {
				const ballotCounts = await countBallotsByGroup(group.ballot_group);
				let fieldValue = '';
				fieldValue += `**${group.ballot_group}**\n`;
				fieldValue += `Total: ${ballotCounts.find(count => count.ballot_group === group.ballot_group).count}\n\n`;

				embed.addFields({
					name: `🗳️ Ballot ${group.ballot_group}`,
                    value: fieldValue || 'No ballots in this group',
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