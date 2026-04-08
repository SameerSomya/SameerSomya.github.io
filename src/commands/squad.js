const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'squad',
    description: 'Manage squads (create, add, view).',
    execute: async (message, args, client) => {
        if (args.length === 0) {
            return message.reply('Specify a subcommand: `create`, `add`, `view`. Usage: !squad <subcommand> [args...]');
        }

        const subcommand = args[0].toLowerCase();

        if (subcommand === 'create') {
            if (!message.member.permissions.has('ManageRoles')) {
                return message.reply('Negative. Only command personnel can create squads.');
            }

            const squadName = args.slice(1).join(' ');
            if (!squadName) return message.reply('Provide a squad designation. Usage: !squad create <SquadName>');

            if (client.db.data.squads[squadName]) {
                return message.reply('A squad with this designation already exists.');
            }

            client.db.data.squads[squadName] = {
                name: squadName,
                leader: message.author.id,
                members: [message.author.id]
            };

            // Also update creator's profile
            const userData = client.db.getUser(message.author.id);
            userData.squad = squadName;

            await client.db.save(client);

            message.channel.send(`**[SQUAD ESTABLISHED]** Squad **${squadName}** has been created under the command of <@${message.author.id}>.`);

        } else if (subcommand === 'add') {
            // Need permission or be the squad leader
            const targetUser = message.mentions.users.first();

            // Reconstruct the squad name, handling multi-word names properly.
            // It filters out the mention string from the arguments.
            const squadNameParts = args.slice(1).filter(arg => !arg.startsWith('<@') && !arg.endsWith('>'));
            const squadName = squadNameParts.join(' ');

            if (!squadName || !targetUser) {
                return message.reply('Invalid syntax. Usage: !squad add <SquadName> @user');
            }

            const squad = client.db.data.squads[squadName];
            if (!squad) {
                return message.reply('Squad designation not found.');
            }

            if (!message.member.permissions.has('ManageRoles') && squad.leader !== message.author.id) {
                return message.reply('Negative. You must be the Squad Leader or High Command to assign personnel.');
            }

            if (squad.members.includes(targetUser.id)) {
                return message.reply('Soldier is already assigned to this squad.');
            }

            squad.members.push(targetUser.id);

            // Update soldier's profile
            const targetData = client.db.getUser(targetUser.id);

            // Remove from old squad if any
            if (targetData.squad && client.db.data.squads[targetData.squad]) {
                const oldSquad = client.db.data.squads[targetData.squad];
                oldSquad.members = oldSquad.members.filter(id => id !== targetUser.id);
            }

            targetData.squad = squadName;
            targetData.serviceRecord.push(`[${new Date().toISOString()}] Reassigned to Squad ${squadName}`);

            await client.db.save(client);

            message.channel.send(`**[REASSIGNMENT]** ${targetUser} has been assigned to **Squad ${squadName}**.`);

        } else if (subcommand === 'view') {
            const squadName = args.slice(1).join(' ');

            if (!squadName) {
                // List all squads
                const squadNames = Object.keys(client.db.data.squads);
                if (squadNames.length === 0) return message.reply('No active squads found in central database.');

                const embed = new EmbedBuilder()
                    .setColor('#1f3b1f')
                    .setTitle('Active Squadrons - Rashtriya Rifles (31st)')
                    .setDescription(squadNames.map(name => `• **${name}** (${client.db.data.squads[name].members.length} personnel)`).join('\n'));

                return message.channel.send({ embeds: [embed] });
            }

            const squad = client.db.data.squads[squadName];
            if (!squad) return message.reply('Squad designation not found.');

            const memberList = squad.members.map(id => {
                const data = client.db.getUser(id);
                return `<@${id}> - ${data.rank} (${data.loadout})`;
            }).join('\n');

            const embed = new EmbedBuilder()
                .setColor('#2d4d2d')
                .setTitle(`Squad Manifest: ${squadName}`)
                .addFields(
                    { name: 'Squad Leader', value: `<@${squad.leader}>` },
                    { name: 'Personnel', value: memberList || 'No assigned personnel' }
                )
                .setFooter({ text: 'Rashtriya Rifles (31st) Command Data' });

            message.channel.send({ embeds: [embed] });
        } else {
            message.reply('Unknown subcommand. Available: `create`, `add`, `view`.');
        }
    }
};
