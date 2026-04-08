require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];

// Manually defining slash commands to avoid needing to refactor all command files
// to dual-support Discord's specific Slash Command Builder format and message format.
commands.push(
    {
        name: 'profile',
        description: 'Display a soldier\'s profile and service statistics.',
        options: [
            {
                name: 'target',
                description: 'The soldier to view',
                type: 6, // USER type
                required: false
            }
        ]
    },
    {
        name: 'record',
        description: 'Display a soldier\'s detailed permanent service record.',
        options: [
            {
                name: 'target',
                description: 'The soldier to view',
                type: 6,
                required: false
            }
        ]
    },
    {
        name: 'promote',
        description: 'Promote a soldier to the next rank.',
        options: [
            {
                name: 'target',
                description: 'The soldier to promote',
                type: 6,
                required: true
            }
        ]
    },
    {
        name: 'demote',
        description: 'Demote a soldier to the previous rank.',
        options: [
            {
                name: 'target',
                description: 'The soldier to demote',
                type: 6,
                required: true
            }
        ]
    },
    {
        name: 'assign_loadout',
        description: 'Assign a combat role/loadout to a soldier.',
        options: [
            {
                name: 'target',
                description: 'The soldier',
                type: 6,
                required: true
            },
            {
                name: 'loadout',
                description: 'The loadout name (e.g. Sniper, Medic)',
                type: 3, // STRING
                required: true
            }
        ]
    },
    {
        name: 'leave',
        description: 'Request or log official Leave of Absence (LOA).',
        options: [
            {
                name: 'reason',
                description: 'Reason or duration for leave',
                type: 3,
                required: true
            }
        ]
    },
    {
        name: 'return',
        description: 'Return from Leave of Absence (LOA).',
    },
    {
        name: 'attend',
        description: 'Log attendance for an active operation.',
        options: [
            {
                name: 'op_id',
                description: 'The Operation ID',
                type: 3,
                required: true
            }
        ]
    }
);

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('[MIL-NET] Initiating slash command synchronization with Discord...');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );

        console.log('[MIL-NET] Slash command synchronization complete.');
    } catch (error) {
        console.error(error);
    }
})();
