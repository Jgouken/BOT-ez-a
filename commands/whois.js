const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const Database = require("@replit/database")
const db = new Database()

module.exports = {
	data: new SlashCommandBuilder()
		.setName('whois')
		.setDescription('Replies with or sets the real name of a user.')
		.addUserOption(option => option.setName('user')
			.setDescription('Choose the target user to get/set the name of.')
			.setRequired(true))
		.addStringOption(option => option.setName('name')
			.setDescription(`Set someone's name in the server.`)
			.setRequired(false)),

	async execute(client, interaction) {
		const target = interaction.options.getUser('user');
		const name = interaction.options.getString('name');

		if (name) {
			// If trying to change a name
			if (interaction.member.user === target) {
				// If trying to change own name
				if (interaction.member.permissions.has([PermissionsBitField.Flags.ChangeNickname])) {
					// If able to change own name
					await interaction.reply({ content: `Set your name to **${name}**!`, ephemeral: false })
					db.set(target.id, name)
				} else {
					// If not able to change own name
					await interaction.reply({ content: `You currently don't have the permissions to set your own name. Ask a moderator to give you the "Change Nickname" permission!`, ephemeral: true })
				}
			} else {
				// Trying to change another person's name
				if (interaction.member.permissions.has([PermissionsBitField.Flags.ManageNicknames])) {
					// If able to change another person's name
					await interaction.reply({ content: `Set <@${target.id}>'s name to **${name}**!`, ephemeral: false })
					db.set(target.id, name)
				} else {
					// If not able to change another person's name
					await interaction.reply({ content: `Sadly, you do not have the permissions to set another person's name! Ask a moderator to give you the "Manage Nicknames" permission!`, ephemeral: true })
				}
			}
		} else {
			// If trying to find someone's name
			db.get(target.id).then(async rname => {
				if (rname) await interaction.reply({ content: `${target.username}'s name is **${rname}**.`, ephemeral: false })
				else { await interaction.reply({ content: `${target.username} does not have a name set!`, ephemeral: true }) }
			});
		}
	}
}