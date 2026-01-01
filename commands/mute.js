const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ComponentType 
} = require('discord.js');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Aplica um castigo (timeout) em um membro.')
        .addUserOption(option => 
            option.setName('alvo')
                .setDescription('Membro a ser silenciado')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('tempo')
                .setDescription('Duração do mute (ex: 10m, 1h, 1d)')
                .setRequired(true)
                .addChoices(
                    { name: '10 Minutos', value: '10m' },
                    { name: '1 Hora', value: '1h' },
                    { name: '1 Dia', value: '1d' },
                    { name: '1 Semana', value: '7d' },
                ))
        .addStringOption(option => 
            option.setName('motivo')
                .setDescription('Motivo do castigo'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const user = interaction.options.getUser('alvo');
        const member = interaction.options.getMember('alvo');
        const durationStr = interaction.options.getString('tempo');
        const reason = interaction.options.getString('motivo') || 'Nenhum motivo fornecido';
        const logChannelId = '1455678835990466745';

        // --- VERIFICAÇÕES DE SEGURANÇA ---
        
        if (!member) {
            return interaction.reply({ content: '❌ Este usuário não está no servidor.', ephemeral: true });
        }

        if (member.id === interaction.guild.ownerId) {
            return interaction.reply({ content: '❌ Erro: Você não pode silenciar o dono do servidor.', ephemeral: true });
        }

        // Verifica se o cargo do bot é menor ou igual ao do alvo (Erro 50013 preventivo)
        if (member.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ 
                content: `❌ **Erro de Hierarquia:** O cargo de **${user.tag}** é igual ou superior ao meu. Arraste meu cargo para o topo nas configurações.`, 
                ephemeral: true 
            });
        }

        const durationMs = ms(durationStr);

        // --- INTERAÇÃO COM BOTÕES ---

        const confirm = new ButtonBuilder()
            .setCustomId('confirm_mute')
            .setLabel('Confirmar Mute')
            .setStyle(ButtonStyle.Danger);

        const cancel = new ButtonBuilder()
            .setCustomId('cancel_mute')
            .setLabel('Cancelar')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(cancel, confirm);

        const response = await interaction.reply({
            content: `⚠️ Você deseja silenciar **${user.tag}** por **${durationStr}**?\n**Motivo:** \`${reason}\``,
            components: [row],
            ephemeral: true
        });

        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 30000 
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'confirm_mute') {
                try {
                    // Tenta aplicar o Timeout
                    await member.timeout(durationMs, reason);

                    // Envio de Log
                    const logChannel = interaction.guild.channels.cache.get(logChannelId);
                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setColor('#FFA500')
                            .setTitle('🔇 Usuário Silenciado')
                            .setThumbnail(user.displayAvatarURL())
                            .addFields(
                                { name: '👤 Usuário:', value: `${user.tag} (${user.id})`, inline: true },
                                { name: '🛡️ Moderador:', value: `${interaction.user.tag}`, inline: true },
                                { name: '⏰ Duração:', value: durationStr, inline: true },
                                { name: '📄 Motivo:', value: reason }
                            )
                            .setTimestamp();
                        
                        await logChannel.send({ embeds: [logEmbed] });
                    }

                    await i.update({ content: `✅ **${user.tag}** foi silenciado com sucesso por ${durationStr}.`, components: [] });

                } catch (error) {
                    if (error.code === 50013) {
                        await i.update({ content: '❌ **Erro 50013:** Permissões insuficientes. Verifique se meu cargo tem a permissão "Castigar Membros" e se está acima do alvo.', components: [] });
                    } else {
                        console.error(error);
                        await i.update({ content: '❌ Ocorreu um erro inesperado ao aplicar o mute.', components: [] });
                    }
                }
            } else {
                await i.update({ content: '❌ Ação cancelada pelo moderador.', components: [] });
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ content: '⏰ O tempo de confirmação esgotou.', components: [] });
            }
        });
    },
};