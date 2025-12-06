const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBallotGroups, getCandidatesByBallotGroup } = require('../models/candidates');
const { getUserSubmittedBallots } = require('../models/ballots');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('my-votes')
		.setDescription('Shows your voting status for all ballot groups.'),
	async execute(interaction) {
		try {
			const ballotGroups = await getBallotGroups();
			const submittedBallots = await getUserSubmittedBallots({ discordId: interaction.user.id });
			const submittedGroups = submittedBallots.map(b => b.ballot_group);

			const embed = new EmbedBuilder()
				.setTitle('📊 **Your Voting Status**')
				.setColor('#3498db')
				.setTimestamp();

			if (!ballotGroups || ballotGroups.length === 0) {
				embed.setDescription('No ballot groups available.');
				await interaction.reply({ embeds: [embed], ephemeral: true });
				return;
			}

			let description = '';
			for (const group of ballotGroups) {
				const candidates = await getCandidatesByBallotGroup(group.ballot_group);
				const candidateNames = candidates.map(c => c.name).join(', ');
				const hasVoted = submittedGroups.includes(group.ballot_group);
				const status = hasVoted ? '✅ **Voted**' : '❌ **Not Voted**';

				description += `**Ballot ${group.ballot_group}:** ${status}\n`;
				description += `*Candidates: ${candidateNames}*\n\n`;
			}

			embed.setDescription(description);

			const totalBallots = ballotGroups.length;
			const votedBallots = submittedBallots.length;
			embed.addFields({
				name: 'Summary',
				value: `${votedBallots}/${totalBallots} ballots completed`
			});

			await interaction.reply({ embeds: [embed], ephemeral: true });
		} catch (error) {
			console.error('Error checking vote status:', error);
			await interaction.reply({
				content: '❌ **Error checking your voting status!** Please try again later.',
				ephemeral: true
			});
		}
	}
};