const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avis')
        .setDescription('Affiche un avis dans un salon spécifié.')
        .addStringOption(option =>
            option.setName('avis')
                .setDescription('avis')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('etoiles')
                .setDescription('Nombre d\'étoiles de l\'avis (de 1 à 5).')
                .setRequired(true)
        )
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('Image associée à l\'avis.')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        const salonId = '1255304175323975683'; // ID du salon où envoyer l'avis

        const userName = interaction.options.getString('avis');
        const stars = interaction.options.getInteger('etoiles');
        const imageAttachment = interaction.options.getAttachment('image');
        
        // Vérification que le nombre d'étoiles est entre 1 et 5
        if (stars < 1 || stars > 5) {
            return await interaction.reply('Le nombre d\'étoiles doit être entre 1 et 5.');
        }

        // Vérification qu'une image a été attachée
        if (!imageAttachment) {
            return await interaction.reply('Veuillez télécharger une image pour l\'avis.');
        }

        // Création de l'embed pour l'avis
        const embed = new EmbedBuilder()
            .setTitle(`Avis ${interaction.user.username}`)
            .setFooter({ text: `Avis envoyer par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setColor('#00ffa3')
            .addFields({
                name: 'Avis', 
                value: `${userName}`
            },
            {
            name:'Étoiles', 
            value:`${'⭐'.repeat(stars)}`
            })
            .setImage(`attachment://${imageAttachment.name}`)
            .setTimestamp();

        // Envoi de l'embed dans le salon spécifié
        try {
            const targetChannel = await interaction.client.channels.fetch(salonId);
            
            await targetChannel.send({ embeds: [embed], files: [imageAttachment] }); // Envoi de l'embed et de l'image dans le salon spécifié
            await interaction.reply({ content: 'Avis envoyé avec succès dans le salon.', ephemeral: true });
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'avis :', error);
            await interaction.reply('Une erreur est survenue lors de l\'envoi de l\'avis dans le salon.');
        }
    },
};
