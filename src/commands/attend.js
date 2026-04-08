module.exports = {
    name: 'attend',
    description: 'Log attendance for an active operation.',
    execute: async (message, args, client) => {
        if (args.length < 1) {
            return message.reply('Specify the operation designation. Usage: !attend <OpID>');
        }

        const opId = args[0];
        const operation = client.db.data.operations.find(op => op.id === opId && op.status === 'Scheduled');

        if (!operation) {
            return message.reply(`Operation designation ${opId} not found or is no longer active.`);
        }

        if (!operation.attendees) operation.attendees = [];

        if (operation.attendees.includes(message.author.id)) {
            return message.reply('You are already logged for this operation. Hold the line.');
        }

        operation.attendees.push(message.author.id);
        await client.db.save(client);

        message.reply(`Attendance confirmed for Operation ${opId}. Awaiting further orders.`);
    }
};
