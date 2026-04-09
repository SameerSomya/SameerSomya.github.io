module.exports = {
    name: 'ban',
    description: 'Ban a soldier from the server.',
    execute: async (message, args, client) => {
        if (!message.member.permissions.has('BanMembers')) {
            return message.reply('Negative. You lack the clearance to ban personnel.');
        }

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('Specify a target. Usage: !ban @user [reason]');
        }

        const targetMember = message.guild.members.cache.get(targetUser.id);

        const reason = args.slice(1).filter(arg => !arg.startsWith('<@')).join(' ') || 'Dishonorable Discharge - No reason specified.';

        try {
            if (targetMember) {
                await targetMember.ban({ reason });
            } else {
                await message.guild.members.ban(targetUser.id, { reason });
            }
            message.channel.send(`**[DISHONORABLE DISCHARGE]** ${targetUser.username} has been permanently removed from the operating area (Banned). Reason: ${reason}`);
        } catch (error) {
            console.error('Ban error:', error);
            message.reply('System Error: Unable to complete ban protocol. Ensure my role is higher than the target.');
        }
    }
};
