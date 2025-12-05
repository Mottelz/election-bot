const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

export async function openBallotModal(interaction) {

	const modal = new ModalBuilder()
		.setCustomId('ballot_modal')
		.setTitle('Submit Your Vote');

	const candidateInput = new TextInputBuilder()
		.setCustomId('candidate_choice')
		.setLabel('Enter your candidate choice')
		.setStyle(TextInputStyle.Short)
		.setPlaceholder('e.g., John Doe')
		.setRequired(true)
		.setMaxLength(100);

	const reasonInput = new TextInputBuilder()
		.setCustomId('vote_reason')
		.setLabel('Why are you voting for this candidate? (Optional)')
		.setStyle(TextInputStyle.Paragraph)
		.setPlaceholder('Enter your reasoning here...')
		.setRequired(false)
		.setMaxLength(1000);

	const firstRow = new ActionRowBuilder().addComponents(candidateInput);
	const secondRow = new ActionRowBuilder().addComponents(reasonInput);

	modal.addComponents(firstRow, secondRow);

	await interaction.showModal(modal);
}