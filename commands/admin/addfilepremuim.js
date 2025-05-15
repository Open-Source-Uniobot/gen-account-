const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../../config.json')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('addfilepremuim')
        .setDescription('Créer un fichier texte avec le nom fourni.')
        .addStringOption(option =>
            option.setName('filename')
                .setDescription('Nom du fichier sans extension')
                .setRequired(true)
        ),
    async execute(interaction) {
        const filename = interaction.options.getString('filename');

        // Vérifier si le nom de fichier est valide
        if (!filename || filename.trim() === '') {
            await interaction.reply({ content: 'Nom de fichier invalide.', ephemeral: true });
            return;
        }
        const userId = interaction.user.id;
        const memberRoles = interaction.member.roles.cache;
        const allowedRoleId = config.admin;
        if (!memberRoles.has(allowedRoleId)) {
            return interaction.reply('Vous n\'avez pas la permission d\'utiliser cette commande.');
        }
        // Ajouter l'extension .txt au nom de fichier
        const fullFilename = `${filename.trim()}.txt`;

        // Chemin complet du fichier
        const filePath = `./datavip/${fullFilename}`;

        // Vérifier si le fichier existe déjà
        if (fs.existsSync(filePath)) {
            await interaction.reply({ content: 'Le fichier existe déjà.', ephemeral: true });
            return;
        }

        // Créer le fichier vide
        try {
            fs.writeFileSync(filePath, '', 'utf8');
            await interaction.reply( `Fichier ${fullFilename} créé avec succès.`);
        } catch (error) {
            console.error('Erreur lors de la création du fichier :', error);
            await interaction.reply({ content: 'Erreur lors de la création du fichier.', ephemeral: true });
        }
    },
};
