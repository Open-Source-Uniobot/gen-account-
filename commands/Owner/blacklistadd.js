const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklistadd')
        .setDescription('Ajoute un membre à la liste noire avec une raison')
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Sélectionnez un membre')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('Raison de l\'ajout à la liste noire')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        const member = interaction.options.getUser('membre');
        const reason = interaction.options.getString('raison');

        // Charger la liste noire depuis le fichier JSON
        const rawdata = fs.readFileSync('./blacklist.json');
        const blacklist = JSON.parse(rawdata);

        if (!blacklist.blacklistedUsers.find(user => user.id === member.id)) {
            blacklist.blacklistedUsers.push({ id: member.id, reason });

            // Enregistrer la liste noire mise à jour dans le fichier JSON
            fs.writeFileSync('./blacklist.json', JSON.stringify(blacklist, null, 2));

            await interaction.reply(`${member.username} a été ajouté à la liste noire pour la raison suivante : ${reason}`);
        } else {
            await interaction.reply(`${member.username} est déjà sur la liste noire.`);
        }
    },
};
