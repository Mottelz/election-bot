const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { addCandidate } = require('../models/candidates');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add-candidate')
		.setDescription('Adds a candidate to the ballot.')
		.addUserOption(option =>
			option.setName('candidate')
				.setDescription('The user to add as a candidate')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		const candidateUser = interaction.options.getUser('candidate');
		const candidateMember = await interaction.guild.members.fetch(candidateUser.id);

		await addCandidate({
			discord_id: candidateUser.id,
			name: candidateMember.displayName,
		});

		return await interaction.reply({
			content: `<@${candidateUser.id}> added successfully!`,
			flags: MessageFlags.Ephemeral,
		});
	}
};