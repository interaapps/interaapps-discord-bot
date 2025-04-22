import {CommandInteraction, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import axios from "axios";

const pastefyApi = axios.create({
    baseURL: 'https://pastefy.app/api/v2'
})

const createEmbed = (paste: any) => {
    const embed = new EmbedBuilder()

    embed.setTitle(paste.title || 'Paste')
        .setDescription(`Here's your paste!:
${'```js'}
${paste.content.substring(0, 100).replace(/`/g, '\\`')}
${'```'}`)
        .setColor(0x3469FF)
        .setURL(`https://pastefy.app/${paste.id}`)
        .setFields(
            {
                name: 'tags',
                value: paste.tags?.length ? paste.tags.join(', ') : 'No tags',
                inline: true
            },
            {
                name: 'url',
                value: `https://pastefy.app/${paste.id}`,
            },
            {
                name: 'raw url',
                value: `https://pastefy.app/${paste.id}/raw`,
            }
        )
        .setFooter({
            iconURL: 'https://storage.interaapps.de/account-avatars/apps/oauth2/z49qp9qxzefsw7r.png',
            text: 'Pastefy'
        })
        .setTimestamp()

    return embed
}

export default {
    async execute(interaction: CommandInteraction) {
        console.log('paste creating!')

        const data = {
            title: interaction.options.get('title')?.value as string,
            content: interaction.options.get('content')?.value as string,
            ai: true,
            visibility: interaction.options.get('public')?.value ? 'PUBLIC' : undefined,
        }

        try {
            const { paste } = (await pastefyApi.post('/paste', data)).data as {paste: any}

            const reply = await interaction.reply({ embeds: [createEmbed(paste)] });
            setTimeout(async () => {
                reply.edit({ embeds: [createEmbed((await pastefyApi.get(`/paste/${paste.id}`)).data)] })
            }, 5000)
        } catch {
            interaction.reply('Error creating paste!')
        }
    },
    command: new SlashCommandBuilder()
        .setName('paste')
        .setDescription('Create pastefy paste!')
        .addStringOption(option => option.setName('content').setRequired(true).setDescription('Paste content'))
        .addStringOption(option => option.setName('title').setRequired(false).setDescription('Title'))
        .addBooleanOption(option => option.setName('public').setRequired(false).setDescription('Is paste visibility public?'))
}