const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ayushfate')
		.setDescription('What is going to happen to Ayush?!'),

	async execute(client, interaction) {
		await interaction.reply('He will be getting the boot.');
	}
}