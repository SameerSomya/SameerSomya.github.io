const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'op',
    description: 'Manage military operations (schedule, report).',
    execute: async (message, args, client) => {
        if (args.length === 0) {
            return message.reply('Specify a subcommand: `schedule`, `report`. Usage: !op <subcommand> [args...]');
        }

        const subcommand = args[0].toLowerCase();

        if (subcommand === 'schedule') {
            if (!message.member.permissions.has('ManageEvents')) {
                return message.reply('Negative. Only high command can schedule operations.');
            }

            const opName = args.slice(1).join(' ');
            if (!opName) return message.reply('Provide an operation designation. Usage: !op schedule <OpName>');

            const opId = `OP-${Date.now().toString().slice(-4)}`;

            client.db.data.operations.push({
                id: opId,
                name: opName,
                status: 'Scheduled',
                date: new Date().toISOString(),
                commander: message.author.id,
                attendees: []
            });
            await client.db.save(client);

            const embed = new EmbedBuilder()
                .setColor('#b32d2d') // Red for alert/operation
                .setTitle(`[ALERT] OPERATION SCHEDULED: ${opName}`)
                .setDescription(`**Designation Code:** ${opId}\n**Commander:** <@${message.author.id}>\n\nAll personnel are required to RSVP by attending roll call.`)
                .setFooter({ text: 'Rashtriya Rifles (31st) • Command' })
                .setTimestamp();

            message.channel.send({ content: '@here', embeds: [embed] });

        } else if (subcommand === 'report') {
            if (!message.member.permissions.has('ManageEvents')) {
                return message.reply('Negative. Only command personnel can submit AARs.');
            }

            const opId = args[1];
            const reportContent = args.slice(2).join(' ');

            if (!opId || !reportContent) {
                return message.reply('Invalid syntax. Usage: !op report <OpID> <AAR Content>');
            }

            const operation = client.db.data.operations.find(op => op.id === opId);
            if (!operation) {
                return message.reply(`Operation designation ${opId} not found in database.`);
            }

            operation.status = 'Completed';
            operation.report = reportContent;

            // Increment attendance for all attendees
            if (operation.attendees) {
                for (const userId of operation.attendees) {
                    const user = client.db.getUser(userId);
                    user.operationsAttended += 1;
                    user.serviceRecord.push(`[${new Date().toISOString()}] Participated in Operation: ${operation.name} (${opId})`);
                }
            }

            await client.db.save(client);

            const embed = new EmbedBuilder()
                .setColor('#264d2b') // Completed green
                .setTitle(`[AAR] AFTER ACTION REPORT: ${operation.name} (${opId})`)
                .setDescription(`**Commander:** <@${message.author.id}>\n**Attendees:** ${operation.attendees.length}\n\n**Report:**\n${reportContent}`)
                .setFooter({ text: 'Rashtriya Rifles (31st) • Command' })
                .setTimestamp();

            message.channel.send({ embeds: [embed] });

        } else {
            message.reply('Unknown subcommand. Available: `schedule`, `report`.');
        }
    }
};
