const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unwarn')
        .setDescription('Remove um aviso (warn) de um usuário.')
        .addUserOption(option => 
            option.setName('alvo')
                .setDescription('O usuário que terá o aviso removido')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('motivo')
                .setDescription('O motivo da remoção do aviso'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const user = interaction.options.getUser('alvo');
        const reason = interaction.options.getString('motivo') || 'Nenhum motivo fornecido';
        const logChannelId = '1455678835990466745'; // Seu canal de logs configurado

        try {
            // Lógica de Banco de Dados: Aqui você adicionaria o código para subtrair 1 warn do usuário.
            // Exemplo: await db.warns.subtract(user.id, 1);

            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            
            const logEmbed = new EmbedBuilder()
                .setColor('#2ecc71') // Verde esmeralda
                .setTitle('⚖️ Aviso Removido')
                .setThumbnail(user.displayAvatarURL())
                .addFields(
                    { name: '👤 Usuário:', value: `${user.tag} (${user.id})`, inline: true },
                    { name: '🛡️ Administrador:', value: `${interaction.user.tag}`, inline: true },
                    { name: '📄 Motivo da Remoção:', value: reason }
                )
                .setFooter({ text: `Executor ID: ${interaction.user.id}` })
                .setTimestamp();

            if (logChannel) {
                await logChannel.send({ embeds: [logEmbed] });
            }

            await interaction.reply({ 
                content: `✅ Um aviso foi removido de **${user.tag}**.`, 
                ephemeral: true 
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: '❌ Houve um erro ao tentar remover o aviso deste usuário.', 
                ephemeral: true 
            });
        }
    },
};