const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('open-voting')
		.setDescription('Opens voting for the current poll.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		const buttonRow = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId('open_ballot')
				.setLabel('Vote Now')
				.setStyle(ButtonStyle.Primary)
				.setEmoji('🗳️')
		);
		return await interaction.reply({ content: 'Voting has been opened!', components: [buttonRow] });
	}
};