export async function processBallotSubmission(interaction) {
	const candidateChoice = interaction.fields.getTextInputValue('candidate_choice');
	const voteReason = interaction.fields.getTextInputValue('vote_reason');

	let responseMessage = `Thank you for voting! Your vote for **${candidateChoice}** has been recorded.`;

	if (voteReason) {
		responseMessage += `\n\nYour reasoning: ${voteReason}`;
	}

	await interaction.reply({
		content: responseMessage,
		flags: MessageFlags.Ephemeral
	});

	console.log(`Vote submitted by ${interaction.user.tag} (${interaction.user.id}): ${candidateChoice}`);
	if (voteReason) {
		console.log(`Reason: ${voteReason}`);
	}
}