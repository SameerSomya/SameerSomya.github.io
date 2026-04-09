const { Ranks } = require('../utils/military');

module.exports = {
    name: 'setrank',
    description: 'Set a specific rank for a soldier (override).',
    execute: async (message, args, client) => {
        if (!message.member.permissions.has('ManageRoles')) {
            return message.reply('Negative. You lack the necessary clearance to issue absolute rank overrides.');
        }

        const targetUser = message.mentions.users.first();
        if (!targetUser || args.length < 2) {
            return message.reply('Invalid syntax. Usage: !setrank @user <RankName>');
        }

        const targetMember = message.guild.members.cache.get(targetUser.id);
        if (!targetMember) {
            return message.reply('Target soldier not found in the server.');
        }

        const requestedRankParts = args.slice(1).filter(arg => !arg.startsWith('<@') && !arg.endsWith('>'));
        const requestedRank = requestedRankParts.join(' ');

        const newRank = Ranks.find(r => r.toLowerCase() === requestedRank.toLowerCase());

        if (!newRank) {
            return message.reply(`Invalid rank specified. Usage: !setrank @user <RankName>`);
        }

        const userData = client.db.getUser(targetUser.id);

        try {
            // Find old role and remove
            const oldRole = message.guild.roles.cache.find(r => r.name === userData.rank);
            if (oldRole && targetMember.roles.cache.has(oldRole.id)) {
                await targetMember.roles.remove(oldRole);
            }

            // Find new role and add
            const newRole = message.guild.roles.cache.find(r => r.name === newRank);
            if (newRole) {
                await targetMember.roles.add(newRole);
            } else {
                message.channel.send(`[WARNING] Discord role for "${newRank}" not found. Please create it to sync.`);
            }

            // Update database
            userData.serviceRecord.push(`[${new Date().toISOString()}] Rank administratively set to ${newRank} by ${message.author.username}`);
            await client.db.updateUser(client, targetUser.id, { rank: newRank });

            message.channel.send(`**[ADMINISTRATIVE OVERRIDE]** ${targetUser} rank has been set to **${newRank}**. Record updated.`);
        } catch (error) {
            console.error('SetRank error:', error);
            message.reply('System Error: Negative. Unable to complete override protocol. Verify permissions.');
        }
    }
};
