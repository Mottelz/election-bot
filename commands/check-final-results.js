const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
} = require("discord.js");
const { getAllCountsVotesByTypeAndCandidate } = require("../models/votes");
const {
  getBallotGroups,
  getCandidatesByBallotGroup,
} = require("../models/candidates");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("check-final-results")
    .setDescription("Checks the final results of the current poll.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    try {
      const ballotGroups = await getBallotGroups();
      if (!ballotGroups || ballotGroups.length === 0) {
        return await interaction.reply({ content: "No ballot groups found." });
      }

      const voteResults = await getAllCountsVotesByTypeAndCandidate();

      // Create a map of votes by candidate and type
      const voteMap = {};
      voteResults.forEach((result) => {
        const key = `${result.candidate}_${result.ballot_group}`;
        if (!voteMap[key]) {
          voteMap[key] = { candidate_name: result.candidate_name };
        }
        voteMap[key][result.type] = result.count;
      });

      const embed = new EmbedBuilder()
        .setTitle("📊 **Election Results**")
        .setColor("#e74c3c")
        .setTimestamp();

      // Process each ballot group
      for (const group of ballotGroups) {
        const candidates = await getCandidatesByBallotGroup(group.ballot_group);

        for (const candidate of candidates) {
          const key = `${candidate.discord_id}_${candidate.ballot_group}`;
          const votes = voteMap[key] || {};
          const yes = votes.yes || 0;
          const no = votes.no || 0;
          const abstain = votes.abstain || 0;
          const total = yes + no + abstain;

          let fieldValue = "";
          if (total > 0) {
            const weightedYes = yes - no;
            const weightedYesPercentage = (weightedYes / total) * 100;
            const noPercentage = (no / total) * 100;
            const abstainPercentage = (abstain / total) * 100;
            const yesPercentage = (yes / total) * 100;

            fieldValue += `**Yes (weighted)**: ${weightedYesPercentage.toFixed(
              2
            )}%\n`;
            fieldValue += `**Yes**: ${yesPercentage.toFixed(2)}%\n`;
            fieldValue += `**No**: ${noPercentage.toFixed(2)}%\n`;
            fieldValue += `**Abstain**: ${abstainPercentage.toFixed(2)}%`;
          } else {
            fieldValue = `No votes yet`;
          }

          // Add each candidate as a separate field
          embed.addFields({
            name: `${candidate.name}`,
            value: fieldValue,
            inline: false,
          });
        }
      }

      return await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error checking poll results:", error);
      return await interaction.reply({
        content: "❌ **Error checking poll results!** Please try again later.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
