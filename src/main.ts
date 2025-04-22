import {
    ChatInputCommandInteraction,
    Client,
    Collection,
    Events,
    GatewayIntentBits,
    SlashCommandBuilder,
    REST,
    Routes
} from 'discord.js';
import pastefyCommand from "./commands/pastefy-command";
import shortenCommand from "./commands/shorten-command";
require('dotenv').config()

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // REQUIRED to read message content
    ],
});

client.on(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}!`);
});

const commands = [
    pastefyCommand,
    shortenCommand
] as {execute: (interaction: ChatInputCommandInteraction) => Promise<void>, command: SlashCommandBuilder}[];

const commandCollection = new Collection()
commands.forEach(command => {
    commandCollection.set(command.command.name, command.command);
})


client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = commands.find(cmd => cmd.command.name === interaction.commandName);
    if (!command) return;
    command.execute(interaction)
});

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_API_TOKEN!);

(async () => {
    try {
        console.log('Registering slash commands...');

        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),

            { body: commandCollection }
        );

        client.guilds.fetch().then(guilds => {
            guilds.forEach(guild => {
                rest.put(
                    Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, guild.id),
                    { body: commandCollection }
                );
            })
        })

        console.log('✅ Successfully registered application commands!');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
})();

client.login(process.env.DISCORD_API_TOKEN);

