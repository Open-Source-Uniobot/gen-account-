const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklistremove')
        .setDescription('Retire un membre de la liste noire')
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Sélectionnez un membre')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        const member = interaction.options.getUser('membre');

        try {
            // Charger la liste noire depuis le fichier JSON
            const rawdata = fs.readFileSync('./blacklist.json', 'utf-8');
            const blacklist = JSON.parse(rawdata);

            const index = blacklist.blacklistedUsers.findIndex(user => user.id === member.id);
            if (index !== -1) {
                const removedUser = blacklist.blacklistedUsers.splice(index, 1)[0];

                // Enregistrer la liste noire mise à jour dans le fichier JSON
                fs.writeFileSync('./blacklist.json', JSON.stringify(blacklist, null, 2));

                await interaction.reply(`${removedUser.id} (${removedUser.reason}) a été retiré de la liste noire.`);
            } else {
                await interaction.reply(`${member.username} n'est pas sur la liste noire.`);
            }
        } catch (error) {
            console.error('Erreur lors de la lecture du fichier JSON :', error);
            await interaction.reply('Une erreur s\'est produite lors de l\'exécution de cette commande.');
        }
    },
};
