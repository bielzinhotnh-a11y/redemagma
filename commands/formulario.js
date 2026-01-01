const { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder, 
    PermissionFlagsBits,
    MessageFlags // Adicionado para resolver o Warning do ephemeral
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('formulario')
        .setDescription('Envia o formulario de recrutamento permanente para este canal.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // 1. Criando a Embed
        const embedPortal = new EmbedBuilder()
            .setAuthor({ 
                name: 'Sistema de Formulario da Rede Magma', 
                iconURL: interaction.guild.iconURL() 
            })
            .setTitle('💠 Formulario Staff: ON')
            .setColor('#2b2d31')
            .setDescription(
                `### 🌌 Torne-se parte da nossa história\n` +
                `*Estamos em busca de mentes brilhantes para compor nossa equipe técnica e moderativa. Você está pronto para o desafio?*\n\n` +
                `**🔹 REQUISITOS DE ELITE**\n` +
                `> 📋 **Postura:** Maturidade e imparcialidade.\n` +
                `> 🕒 **Atividade:** Presença diária mínima confirmada.\n` +
                `> 🛡️ **Conhecimento:** Domínio de comandos e plugins.\n\n` +
                `**🔸 Processo de Seleção**\n` +
                `Ao clicar no botão abaixo, um protocolo de segurança será aberto via Modal.`
            )
            .addFields(
                { 
                    name: '📊 Online', 
                    value: '```fix\nAguardando Novos Candidatos!\n```', 
                    inline: false 
                }
            )
            .setTimestamp()
            .setFooter({ text: 'Sistema Criptografado de Recrutamento • v3.0' });

        // SOLUÇÃO DO ERRO: Só adiciona a imagem se o link for válido. 
        // Se você não tiver um link real agora, deixe esta linha comentada ou use um link válido.
        const bannerURL = 'https://media.discordapp.net/attachments/1453430686211117133/1455777864409546785/image.png?ex=6955f649&is=6954a4c9&hm=c10f17e9a03906cdca2801a5b6331ba9f4fc146ee27962316357462cdf4ad91d&=&format=webp&quality=lossless'; // Exemplo de link válido
        if (bannerURL && bannerURL.startsWith('http')) {
            embedPortal.setImage(bannerURL);
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('abrir_formulario')
                .setLabel('Iniciar')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📝'),
            
            new ButtonBuilder()
                .setLabel('Regras')
                .setStyle(ButtonStyle.Link)
                .setURL('https://discord.com/channels/1454359732658638956/1454529561764171968') // Certifique-se que este link começa com https://
                .setEmoji('📰')
        );

        // SOLUÇÃO DO WARNING: Usando flags: MessageFlags.Ephemeral
        await interaction.reply({ 
            content: '✅ **Formulario de Recrutamento enviado com sucesso!**', 
            flags: [MessageFlags.Ephemeral] 
        });

        await interaction.channel.send({ 
            embeds: [embedPortal], 
            components: [row] 
        });
    },
};