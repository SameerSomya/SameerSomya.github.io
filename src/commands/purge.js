module.exports = {
    name: 'purge',
    description: 'Bulk delete messages from a channel.',
    execute: async (message, args, client) => {
        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply('Negative. You lack the clearance to purge communications.');
        }

        const amount = parseInt(args[0]);

        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply('Specify a number of messages between 1 and 100. Usage: !purge <amount>');
        }

        try {
            const deleted = await message.channel.bulkDelete(amount, true);
            const confirmation = await message.channel.send(`**[COMMUNICATIONS PURGED]** Cleared ${deleted.size} messages from the channel.`);

            // Delete confirmation after 3 seconds
            setTimeout(() => {
                confirmation.delete().catch(() => {});
            }, 3000);
        } catch (error) {
            console.error('Purge error:', error);
            message.reply('System Error: Unable to purge communications. Messages older than 14 days cannot be bulk deleted.');
        }
    }
};
