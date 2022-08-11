const { Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.js');
const { REST } = require('@discordjs/rest');

module.exports = {
	async execute(client, sCommands) {
		const rest = new REST({ version: '10' }).setToken(token);

		rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: sCommands.map(command => command.toJSON()) })
			.then(() => console.log(`Successfully re-registered application commands.\n\n`))
			.catch(console.error);

		setInterval(async () => {
			let guild = client.guilds.cache.get("980707402640945212")
			let list = [['english-h 📕', 'english-n📖'], ['geometry-h 📐', 'geometry-n📏', 'algebra-1📒'], ['biology-h🐸', 'biology-n🦉'], ['spanish-2🇪🇸', 'spanish-1🇲🇽']]
			// Notice that in different subjects are wrapped in []s ^
			// THE NAMES HERE NEED TO BE EXACT TO THE ROLE NAMES IN DISCORD; EMOJIS, SPACES, AND ALL.

			guild.members.cache.forEach(async mem => {
				if (mem.roles.cache.has('980939098208497685') || mem.roles.cache.has('980940737426366464')) mem.roles.add(guild.roles.cache.find(rl => rl.name == 'AP Scholar✨'))

				list.forEach(a => {
					var i = -1
					while (i < a.length - 1) {
						i++
						let role = guild.roles.cache.find(rl => rl.name == a[i])
						if (mem.roles.cache.has(role.id)) {
							a.forEach(r => {
								if (a.indexOf(r) > i) {
									let giveRole = guild.roles.cache.find(rl => rl.name == r)
									if (!mem.roles.cache.has(giveRole.id)) {
										mem.roles.add(giveRole)
									}
								}
							})
							break;
						}
					}
				})
			})
		}, 60000) // 60000 = 1 minute
	}
}