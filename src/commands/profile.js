const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'profile',
    description: 'Display a soldier\'s profile and service statistics.',
    execute: async (message, args, client) => {
        const targetUser = message.mentions.users.first() || message.author;
        const targetMember = message.guild.members.cache.get(targetUser.id);

        const userData = client.db.getUser(targetUser.id);

        const joinDate = new Date(userData.joinDate).toLocaleDateString();

        const embed = new EmbedBuilder()
            .setColor('#2e3b2c') // Military olive drab
            .setTitle(`Military Record: ${targetMember ? targetMember.displayName : targetUser.username}`)
            .setThumbnail(targetUser.displayAvatarURL())
            .addFields(
                { name: 'Rank', value: userData.rank, inline: true },
                { name: 'Specialization', value: userData.loadout, inline: true },
                { name: 'Status', value: userData.leaveStatus, inline: true },
                { name: 'Squadron', value: userData.squad || 'Unassigned', inline: true },
                { name: 'Operations Attended', value: `${userData.operationsAttended}`, inline: true },
                { name: 'Enlistment Date', value: joinDate, inline: true }
            )
            .setFooter({ text: 'Rashtriya Rifles (31st) • Central Command Data' })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
