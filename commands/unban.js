const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Remove o banimento de um usuário.')
        .addStringOption(option => 
            option.setName('id')
                .setDescription('O ID do usuário que deseja desbanir')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('motivo')
                .setDescription('O motivo da revogação'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const userId = interaction.options.getString('id');
        const reason = interaction.options.getString('motivo') || 'Nenhum motivo fornecido';
        const logChannelId = '1455678835990466745';

        // 1. Validação básica: verificar se o ID contém apenas números
        if (!/^\d+$/.test(userId)) {
            return interaction.reply({ content: '❌ Isso não parece um ID válido. IDs contêm apenas números.', ephemeral: true });
        }

        try {
            // 2. Tentar buscar o banimento antes de remover (para confirmar que o ID existe na lista)
            const ban = await interaction.guild.bans.fetch(userId).catch(() => null);

            if (!ban) {
                return interaction.reply({ 
                    content: `❌ O usuário com ID \`${userId}\` não foi encontrado na lista de banidos deste servidor.`, 
                    ephemeral: true 
                });
            }

            await interaction.guild.members.unban(userId, reason);
            
            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            const logEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🔓 Banimento Removido')
                .addFields(
                    { name: '👤 Usuário:', value: `${ban.user.tag} (\`${userId}\`)`, inline: true },
                    { name: '🛡️ Moderador:', value: `${interaction.user.tag}`, inline: true },
                    { name: '📄 Motivo:', value: reason }
                )
                .setTimestamp();

            if (logChannel) await logChannel.send({ embeds: [logEmbed] });

            await interaction.reply({ content: `✅ O banimento de **${ban.user.tag}** foi removido.`, ephemeral: true });

        } catch (error) {
            // 3. Trata o erro 10013 (Unknown User) especificamente
            if (error.code === 10013) {
                return interaction.reply({ content: '❌ O Discord não reconheceu esse ID como um usuário válido.', ephemeral: true });
            }
            
            console.error(error);
            await interaction.reply({ content: '❌ Ocorreu um erro inesperado ao tentar desbanir.', ephemeral: true });
        }
    },
};