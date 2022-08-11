const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Replies with user info!'),

	async execute(client, interaction) {
		await interaction.reply('User info.');
	}
}