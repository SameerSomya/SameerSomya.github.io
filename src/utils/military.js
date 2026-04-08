const Ranks = [
    'Sepoy',
    'Lance Naik',
    'Naik',
    'Havildar',
    'Naib Subedar',
    'Subedar',
    'Subedar Major',
    'Lieutenant',
    'Captain',
    'Major',
    'Lieutenant Colonel',
    'Colonel',
    'Brigadier',
    'Major General',
    'Lieutenant General',
    'General'
];

const Loadouts = [
    'Rifleman',
    'Sniper',
    'Medic',
    'Radioman',
    'Engineer',
    'Machine Gunner'
];

module.exports = {
    Ranks,
    Loadouts,
    getRankLevel: (rankName) => Ranks.indexOf(rankName),
    getNextRank: (currentRank) => {
        const idx = Ranks.indexOf(currentRank);
        if (idx === -1 || idx === Ranks.length - 1) return null;
        return Ranks[idx + 1];
    },
    getPreviousRank: (currentRank) => {
        const idx = Ranks.indexOf(currentRank);
        if (idx <= 0) return null;
        return Ranks[idx - 1];
    }
};
