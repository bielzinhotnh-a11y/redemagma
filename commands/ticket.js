const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Envia a mensagem de sistema de tickets.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Apenas admins podem usar
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setAuthor({ name: 'RedeMagma', iconURL: interaction.client.user.displayAvatarURL() })
            .setTitle('Olá, jogador! 👋')
            .setDescription('Em caso de dúvidas ou problemas, nossa equipe está à disposição para ajudar!\n\nInicie um atendimento e entre em contato direto com nossa equipe por meio de um canal privado e seguro. Desta maneira, poderemos resolver seu problema da melhor e mais eficaz maneira.\n\n**☎️ Diretrizes de atendimento:**\n\n• Faremos o possível para responder as suas mensagens o mais rápido possível.\n• Se considerarmos que a questão foi resolvida ou se não recebermos resposta dentro de 12 horas, o atendimento será encerrado.\n• Pedimos que mantenha o respeito dentro do atendimento, estamos aqui para ajudá-lo(a) da **melhor forma possível!**\n\n▼ Selecione uma categoria abaixo de acordo com a sua necessidade:')
            .setFooter({ text: 'Rede Magma - Atendimento' });

        const select = new StringSelectMenuBuilder()
            .setCustomId('ticket_select')
            .setPlaceholder('Selecione uma categoria...')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Suporte')
                    .setDescription('Clique aqui para chamar sua dúvida ou receber ajuda.')
                    .setEmoji('🤔')
                    .setValue('suporte'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Loja')
                    .setDescription('Clique aqui para criar um atendimento referente à loja.')
                    .setEmoji('🛒')
                    .setValue('loja'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Denúncias')
                    .setDescription('Clique aqui para denunciar um jogador.')
                    .setEmoji('🚨')
                    .setValue('denuncia'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Revisão de punição')
                    .setDescription('Clique aqui para solicitar uma revisão da sua punição.')
                    .setEmoji('🛑')
                    .setValue('revisao')
            );

        const row = new ActionRowBuilder().addComponents(select);

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};