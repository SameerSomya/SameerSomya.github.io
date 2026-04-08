const { Loadouts } = require('../utils/military');

module.exports = {
    name: 'assign_loadout',
    description: 'Assign a combat role/loadout to a soldier.',
    execute: async (message, args, client) => {
        if (!message.member.permissions.has('ManageRoles')) {
            return message.reply('Negative. You lack the necessary clearance to assign loadouts.');
        }

        const targetUser = message.mentions.users.first();
        if (!targetUser || args.length < 2) {
            return message.reply('Invalid syntax. Usage: !assign_loadout @user <LoadoutName>');
        }

        const loadoutName = args.slice(1).join(' ');

        // Capitalize properly to match the array
        const matchedLoadout = Loadouts.find(l => l.toLowerCase() === loadoutName.toLowerCase());

        if (!matchedLoadout) {
            return message.reply(`Invalid loadout specified. Available loadouts: ${Loadouts.join(', ')}`);
        }

        const targetMember = message.guild.members.cache.get(targetUser.id);
        if (!targetMember) {
            return message.reply('Target soldier not found in the server.');
        }

        const userData = client.db.getUser(targetUser.id);

        // Discord Role Sync Logic
        try {
            // Remove old loadout role if exists
            const oldRole = message.guild.roles.cache.find(r => r.name === userData.loadout);
            if (oldRole && targetMember.roles.cache.has(oldRole.id)) {
                await targetMember.roles.remove(oldRole);
            }

            // Add new loadout role
            const newRole = message.guild.roles.cache.find(r => r.name === matchedLoadout);
            if (newRole) {
                await targetMember.roles.add(newRole);
            } else {
                message.channel.send(`[WARNING] Discord role for "${matchedLoadout}" not found. Please create it to sync.`);
            }

            // Update database
            userData.serviceRecord.push(`[${new Date().toISOString()}] Reassigned to ${matchedLoadout} by ${message.author.username}`);
            await client.db.updateUser(client, targetUser.id, { loadout: matchedLoadout });

            message.channel.send(`**[REASSIGNMENT]** ${targetUser} is now operating as **${matchedLoadout}**. Acknowledged and recorded.`);
        } catch (error) {
            console.error('Assign Loadout error:', error);
            message.reply('System Error: Unable to complete reassignment protocol. Check permissions.');
        }
    }
};
