client.on('messageDelete', async (message) => {
    // Ignora se a mensagem não estiver em cache ou for de bot
    if (!message.guild || message.author?.bot) return;

    const logChannel = message.guild.channels.cache.get('ID_DO_CANAL_DE_LOGS');
    if (!logChannel) return;

    // Aguarda um pouco para o Discord registrar o log de auditoria
    await new Promise(r => setTimeout(r, 1000));

    // Busca o log de exclusão mais recente
    const fetchedLogs = await message.guild.fetchAuditLogs({
        limit: 1,
        type: 72, // MessageDelete
    });

    const deletionLog = fetchedLogs.entries.first();
    let executor = message.author; // Por padrão, assume que o autor apagou

    // Verifica se o log condiz com a mensagem deletada
    if (deletionLog) {
        const { executor: mod, target } = deletionLog;
        if (target.id === message.author.id && (Date.now() - deletionLog.createdTimestamp) < 5000) {
            executor = mod;
        }
    }

    const embed = new EmbedBuilder()
        .setColor('#ff4757')
        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
        .setTitle('🗑️ Mensagem Excluída')
        .addFields(
            { name: '👤 Autor:', value: `${message.author}`, inline: true },
            { name: '🛡️ Apagado por:', value: `${executor}`, inline: true },
            { name: '📍 Canal:', value: `${message.channel}`, inline: false },
            { name: '📄 Conteúdo:', value: `\`\`\`${message.content || "Sem conteúdo de texto"}\`\`\`` }
        )
        .setFooter({ text: `ID do Usuário: ${message.author.id}` })
        .setTimestamp();

    logChannel.send({ embeds: [embed] });
});