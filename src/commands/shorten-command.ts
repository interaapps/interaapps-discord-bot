import {CommandInteraction, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import axios from "axios";
import * as repl from "node:repl";

const punyshortApi = axios.create({
    baseURL: 'https://api.punyshort.intera.dev/v1'
})

const createEmbed = (shortenLink: any) => {
    const embed = new EmbedBuilder()

    embed.setTitle('punyshort')
        .setDescription(`Shorten your long URL!`)
        .setColor(0xff5880)
        .setURL(shortenLink.full_link)

        .setDescription(`Here's your paste!:
${'```md'}
${shortenLink.full_link}
${'```'}`)
        .setFields(
            {
                name: 'long url',
                value: shortenLink.long_link,
            },
            {
                name: 'shortened url',
                value: shortenLink.full_link,
            }
        )
        .setFooter({
            iconURL: 'https://cdn.interaapps.de/service/accounts/images/projects/105_03d25c7071bce10d6b462d53854b969d9f61b982e3aee8771bdcca1ecb70495574e6929042f52e859ee9a253b58f776514180ff16e1338f5505e86c7ff328f72.png',
            text: 'punyshort'
        })
        .setTimestamp()

    return embed
}

export default {
    async execute(interaction: CommandInteraction) {
        const data = {
            domain: 'puny',
            long_link: interaction.options.get('link')?.value as string,
        }

        try {
            const shortenLink = (await punyshortApi.post('/shorten-links', data)).data
            await interaction.reply({ embeds: [createEmbed(shortenLink)] });
        } catch {
            interaction.reply('Error creating shorten link. Is the link valid?')
        }
    },
    command: new SlashCommandBuilder()
        .setName('shorten')
        .setDescription('Shorten your long URL!')
        .addStringOption(option => option.setName('link').setRequired(true).setDescription('Long Link'))
}