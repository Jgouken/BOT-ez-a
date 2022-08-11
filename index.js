const { Client, Collection, IntentsBitField } = require('discord.js');
const { token } = require('./config.js');
const startup = require('./startup.js');
const fs = require('fs');
const path = require('path');
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const sCommands = []
const client = new Client({ intents: new IntentsBitField().add(IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildPresences, IntentsBitField.Flags.GuildMembers) });
client.commands = new Collection();

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	sCommands.push(command.data)
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	console.log(`\n\nReady!`);
	startup.execute(client, sCommands)
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;
	if (!interaction.inGuild) return;
	const { commandName } = interaction;
	const called = client.commands.get(commandName)
	if (called) called.execute(client, interaction)

});

// Login to Discord with your client's token
client.login(token);