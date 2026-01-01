const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Aplica um aviso a um usuário.')
        .addUserOption(option => 
            option.setName('alvo')
                .setDescription('O usuário que receberá o aviso')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('motivo')
                .setDescription('O motivo do aviso'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const user = interaction.options.getUser('alvo');
        const reason = interaction.options.getString('motivo') || 'Nenhum motivo fornecido';
        const logChannelId = '1455678835990466745';

        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        
        const logEmbed = new EmbedBuilder()
            .setColor('#FFA500') // Laranja
            .setTitle('⚠️ Novo Aviso Aplicado')
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: '👤 Usuário:', value: `${user.tag} (${user.id})`, inline: true },
                { name: '🛡️ Moderador:', value: `${interaction.user.tag}`, inline: true },
                { name: '📄 Motivo:', value: reason }
            )
            .setFooter({ text: `ID do infrator: ${user.id}` })
            .setTimestamp();

        if (logChannel) {
            await logChannel.send({ embeds: [logEmbed] });
        }

        await interaction.reply({ 
            content: `✅ Aviso aplicado com sucesso para **${user.tag}**.`, 
            ephemeral: true 
        });
    },
};