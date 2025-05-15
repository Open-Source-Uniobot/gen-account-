const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stock-premium')
        .setDescription('Voir le nombre de fichiers de comptes Premium'),

    async execute(interaction) {
        try {
            const files = fs.readdirSync('./datavip').filter(file => file.endsWith('.txt'));

            if (files.length === 0) {
                return await interaction.reply('Aucun fichier .txt trouvé dans le répertoire.');
            }

            const totalFiles = files.length;

            let description = ''; // Initialisation de la chaîne de description vide

            const fileData = files.map(file => {
                const filePath = `./datavip/${file}`;
                const services = fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean);
                const fileName = file.replace('.txt', '');
                description += `**${fileName}** - ${services.length} compte(s)\n`; // Ajout des détails au texte de la description
                return { fileName, count: services.length };
            });

            // Construire l'embed à afficher
            const embed = new EmbedBuilder()
                .setTitle('Stock de comptes Premium')
                .setDescription(`Nombre total de compte : ${totalFiles}\n\n${description}`)
                .setTimestamp();


            // Envoyer l'embed en réponse à l'interaction
            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Erreur lors de l\'exécution de la commande :', error);
            await interaction.reply('Une erreur est survenue lors de la récupération des données.');
        }
    },
};
