const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'record',
    description: 'Display a soldier\'s detailed permanent service record.',
    execute: async (message, args, client) => {
        const targetUser = message.mentions.users.first() || message.author;
        const userData = client.db.getUser(targetUser.id);

        let recordText = '';
        if (!userData.serviceRecord || userData.serviceRecord.length === 0) {
            recordText = 'No major incidents or actions recorded for this operative.';
        } else {
            // Get the last 10 records, reverse them so newest is first
            const recentRecords = userData.serviceRecord.slice(-10).reverse();
            recordText = recentRecords.join('\n');
        }

        const embed = new EmbedBuilder()
            .setColor('#1a2118') // Darker military green
            .setTitle(`Service Record: ${targetUser.username}`)
            .setDescription(`**CLASSIFIED // PERSONNEL DATA**\n\n${recordText}`)
            .setFooter({ text: 'Rashtriya Rifles (31st) • Only displaying last 10 entries' })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
