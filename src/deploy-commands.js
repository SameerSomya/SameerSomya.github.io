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
    },
    {
        name: 'setrank',
        description: 'Set a specific rank for a soldier (override).',
        options: [
            {
                name: 'target',
                description: 'The soldier',
                type: 6,
                required: true
            },
            {
                name: 'rank',
                description: 'The rank name',
                type: 3,
                required: true
            }
        ]
    },
    {
        name: 'kick',
        description: 'Kick a soldier from the server.',
        options: [
            {
                name: 'target',
                description: 'The soldier to kick',
                type: 6,
                required: true
            },
            {
                name: 'reason',
                description: 'Reason for discharge',
                type: 3,
                required: false
            }
        ]
    },
    {
        name: 'ban',
        description: 'Ban a soldier from the server.',
        options: [
            {
                name: 'target',
                description: 'The soldier to ban',
                type: 6,
                required: true
            },
            {
                name: 'reason',
                description: 'Reason for discharge',
                type: 3,
                required: false
            }
        ]
    },
    {
        name: 'timeout',
        description: 'Temporarily mute (timeout) a soldier.',
        options: [
            {
                name: 'target',
                description: 'The soldier to timeout',
                type: 6,
                required: true
            },
            {
                name: 'minutes',
                description: 'Duration in minutes',
                type: 4, // INTEGER
                required: true
            },
            {
                name: 'reason',
                description: 'Reason for timeout',
                type: 3,
                required: false
            }
        ]
    },
    {
        name: 'purge',
        description: 'Bulk delete messages from a channel.',
        options: [
            {
                name: 'amount',
                description: 'Number of messages (1-100)',
                type: 4,
                required: true
            }
        ]
    },
    {
        name: 'apply',
        description: 'Get the application link to join the Rashtriya Rifles (31st).'
    },
    {
        name: 'op',
        description: 'Manage military operations (schedule, report).',
        options: [
            {
                name: 'schedule',
                description: 'Schedule a new operation',
                type: 1, // SUB_COMMAND
                options: [
                    {
                        name: 'op_name',
                        description: 'The name of the operation',
                        type: 3, // STRING
                        required: true
                    }
                ]
            },
            {
                name: 'report',
                description: 'Submit an After Action Report',
                type: 1, // SUB_COMMAND
                options: [
                    {
                        name: 'op_id',
                        description: 'The Operation ID',
                        type: 3,
                        required: true
                    },
                    {
                        name: 'content',
                        description: 'The AAR content',
                        type: 3,
                        required: true
                    }
                ]
            }
        ]
    },
    {
        name: 'squad',
        description: 'Manage squads (create, add, view).',
        options: [
            {
                name: 'create',
                description: 'Create a new squad',
                type: 1, // SUB_COMMAND
                options: [
                    {
                        name: 'squad_name',
                        description: 'The name of the squad',
                        type: 3, // STRING
                        required: true
                    }
                ]
            },
            {
                name: 'add',
                description: 'Assign a soldier to a squad',
                type: 1, // SUB_COMMAND
                options: [
                    {
                        name: 'squad_name',
                        description: 'The name of the squad',
                        type: 3,
                        required: true
                    },
                    {
                        name: 'target',
                        description: 'The soldier to assign',
                        type: 6, // USER
                        required: true
                    }
                ]
            },
            {
                name: 'view',
                description: 'View a squad roster',
                type: 1, // SUB_COMMAND
                options: [
                    {
                        name: 'squad_name',
                        description: 'The name of the squad (leave blank to list all)',
                        type: 3,
                        required: false
                    }
                ]
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
