const { SlashCommandBuilder } = require("@discordjs/builders")
const Discord = require('discord.js')
const Modlog = require("../models/Modlog")
const Locked = require("../models/Locked")
module.exports = {
    data: new SlashCommandBuilder()
    .setName("lockchannel")
    .setDescription("locks selected channel")
    .addChannelOption(option =>
        option.setName('channel')
            .setDescription('channel to lock')
            .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('reason')
            .setDescription('reason')
            .setRequired(true)
    ),
    async execute(interaction) {
        const reason = interaction.options.getString('reason')
        const channel = interaction.options.getChannel('channel')
        const modlog = await Modlog.findOne({guild_id: interaction.guild.id})
        if (interaction.guild.members.cache.get(interaction.user.id).permissions.has(Discord.Permissions.FLAGS.MANAGE_MESSAGES) || interaction.guild.members.cache.get(interaction.user.id).permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR) || interaction.user.id === '754381104034742415') {
            if (interaction.options.getChannel("channel").type !== 'GUILD_TEXT') {
			interaction.reply('This command is only applicable for text channels')
			return
            } 
            channel.permissionOverwrites.edit(channel.guild.roles.everyone, {SEND_MESSAGES: false })
            const embed = new Discord.MessageEmbed()
            .setColor('#00ffff')
             .setTitle(`locked ${channel.name}`)
             .setDescription(`reason: ${reason}\n` + `moderator: ${interaction.user.username}`)
             interaction.reply({ embeds: [embed] })
             Locked.findOne({guild_id: interaction.guild.id}, (err, settings) => {
                if (err) {
                    console.log(err)
                    interaction.reply("An error occurred while adding locked channel to database!")
                    return
                }else {
                    settings = new Locked({
                        guild_id: interaction.guild.id,
                        channelname: channel.name,
                        moderatorId: interaction.user.id,
                        reason: interaction.options.getString('reason'),
                    })
                } 
                settings.save(err => {
                    if (err) {
                        console.log(err)
                        interaction.reply("An error occurred while adding locked channel to database!")
                        return
                    }
                })
            })
             if (!modlog) {
                return
            }else{
                const abc = interaction.guild.channels.cache.get(modlog.modlog_channel_id)
                abc.send({
                    embeds: [embed] 
                })	
            }
        } else {
            interaction.reply('Insufficant Permissions')
        }
    }
}