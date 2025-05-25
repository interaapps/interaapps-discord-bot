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
import express from 'express';

require('dotenv').config()

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // REQUIRED to read message content
    ],
});

const activities = [
    {
        name: 'pastefy',
        url: 'https://pastefy.app'
    },
    {
        name: 'pastefy codebox',
        url: 'https://box.pastefy.app'
    },
    {
        name: 'punyshort',
        url: 'https://puny.be'
    },
    {
        name: 'quotysco',
        url: 'https://quotysco.eu'
    }
]

client.on(Events.ClientReady, readyClient => {
    client.user?.setActivity(activities[0]);
    setInterval(() => {
        const activity = activities[Math.floor(Math.random() * activities.length)];
        client.user?.setActivity(activity);
    }, 10000)
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

const HONEY_POT_CHANNEL_ID = '1376199931110625404'
const BOT_INFO_CHANNEL_ID = '1376201783969448019'
const UNSOFT_BAN_CHANNEL_ID = '1376204201759211530'
const SOFT_BAN_ROLE_ID = '1376203304677146688'

client.on(Events.MessageCreate, async message => {
    if (message.channelId === HONEY_POT_CHANNEL_ID) {
        await message.author.send("This Discord server is not about any roblox scripts or games. You have been soft-banned for posting them.");
        await message.delete()
        await message.member?.roles.add(SOFT_BAN_ROLE_ID)

        const infoChannel = await client.channels.fetch(BOT_INFO_CHANNEL_ID)
        if (infoChannel?.isSendable()) {
            infoChannel.send(`User ${message.author.toString()} has been soft-banned for posting in the roblox honeypot channel. Message: ${message.content}`);
        }
        return;
    }

    if (message.member?.roles.cache.find(r => r.id === SOFT_BAN_ROLE_ID)) {
        if (message.channelId === UNSOFT_BAN_CHANNEL_ID) {
            return;
        }
        await message.delete()
    }
})

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

const webServer = express();
webServer.get('/', (req, res) => {
    res.send('Discord Bot!')
})

webServer.listen(process.env.SERVER_PORT || 3000, () => {
    console.log(`Web server is running on port ${process.env.SERVER_PORT || 3000}`);
})

