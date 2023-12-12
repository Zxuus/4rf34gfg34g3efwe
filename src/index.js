// CHECKPOINT
require("dotenv").config();
const fs = require('fs');
const { Client, IntentsBitField, EmbedBuilder, ChannelType, AttachmentBuilder } = require("discord.js");

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.on("ready", () => {
    console.log(`${client.user.tag} está listo.`);
});

const targetUser = null; 

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === "finish") {
        const isAdmin = interaction.member.permissions.has("Administrator");

        if (!isAdmin) {
            return interaction.reply("Solo los administradores pueden usar este comando.");
        }

        const targetUser = interaction.options.getUser("user");
        const channel = interaction.channel;

        if (!targetUser) {
            return interaction.reply("Por favor, menciona a un usuario válido.");
        }

        await channel.permissionOverwrites.create(targetUser, { ViewChannel: false });

        const messages = await channel.messages.fetch({ limit: 100, user: 'bots' });
        const messagesArray = Array.from(messages.values());

        let htmlContent = `<html><head><style>
    body {
        background-color: #282b30;
        color: #1e2124;
        font-family: Arial, sans-serif;
        padding: 20px;
    }
    img {
        /*  */
    }
</style></head><body>`;

// Cambiado forEach por un bucle for que comienza desde el último índice
for (let i = messagesArray.length - 1; i >= 0; i--) {
    const msg = messagesArray[i];

    htmlContent += `<div style="background-color: #36393e; color: #ffffff; border: 1px solid #1e2124; padding: 10px; margin: 10px;">`; // Contenedor para cada mensaje
    
    // Obtener la URL de la foto de perfil del usuario
    const authorAvatarURL = msg.author.displayAvatarURL({ format: 'png', dynamic: true, size: 64 });
    
    // Mostrar la foto de perfil del usuario
    htmlContent += `<img src="${authorAvatarURL}" alt="User Avatar"/>`;
    
    htmlContent += `<p><strong>${msg.author.tag}:</strong> ${msg.content}</p>`;

    // Procesar imágenes adjuntas
    msg.attachments.forEach((attachment) => {
        htmlContent += `<img src="${attachment.url}" alt="Attachment"/>`;
    });

    // Procesar embeds
    if (msg.embeds.length > 0) {
        msg.embeds.forEach((embed) => {
            htmlContent += `<div style="background-color: #36393e; color: #ffffff; border: 1px solid #${embed.hexColor}; padding: 10px; margin: 10px;">`; // Contenedor para cada embed
            htmlContent += `<p>Embed: ${embed.title}</p>`;

            if (embed.description) {
                htmlContent += `<p>${embed.description}</p>`;
            }

            if (embed.image) {
                htmlContent += `<img src="${embed.image.url}" alt="Embed Image"/>`;
            }

            if (embed.thumbnail) {
                htmlContent += `<img src="${embed.thumbnail.url}" alt="Embed Thumbnail"/>`;
            }

            // Procesar campos del embed
            if (embed.fields && embed.fields.length > 0) {
                embed.fields.forEach((field) => {
                    htmlContent += `<p><strong>${field.name}:</strong> ${field.value}</p>`;
                });
            }

            htmlContent += `</div>`; // Cierre del contenedor para cada embed
        });
    }

    htmlContent += `</div>`; // Cierre del contenedor para cada mensaje
}

htmlContent += `</body></html>`;



        fs.writeFileSync('messages.html', htmlContent);

        const file = new AttachmentBuilder('messages.html');
        const channelActual = interaction.channel;
        targetUser.send(`Here is your ticket to view the checkout (${channelActual.name}). Download and open it in HTML format.`);
        targetUser.send({ files: [file] })

        return interaction.reply(`Se ha revocado el acceso al canal para ${targetUser.tag}. Recuerda agregar la informacion de las transaciones aquí y hacer un /close.`);
        

    }
});
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === "close") {
        const isAdmin = interaction.member.permissions.has("Administrator");

        if (!isAdmin) {
            return interaction.reply("Solo los administradores pueden usar este comando.");
        }
        const channel = interaction.channel;

        const messages = await channel.messages.fetch({ limit: 100, user: 'bots' });
        const messagesArray = Array.from(messages.values());
        interaction.reply("Registro creado.");
        let htmlContent = `<html><head><style>
    body {
        background-color: #282b30;
        color: #1e2124;
        font-family: Arial, sans-serif;
        padding: 20px;
    }
    img {
        /* -- */
    }
</style></head><body>`;

// Cambiado forEach por un bucle for que comienza desde el último índice
for (let i = messagesArray.length - 1; i >= 0; i--) {
    const msg = messagesArray[i];

    htmlContent += `<div style="background-color: #36393e; color: #ffffff; border: 1px solid #1e2124; padding: 10px; margin: 10px;">`; // Contenedor para cada mensaje
    
    // Obtener la URL de la foto de perfil del usuario
    const authorAvatarURL = msg.author.displayAvatarURL({ format: 'png', dynamic: true, size: 64 });
    
    // Mostrar la foto de perfil del usuario
    htmlContent += `<img src="${authorAvatarURL}" alt="User Avatar"/>`;
    
    htmlContent += `<p><strong>${msg.author.tag}:</strong> ${msg.content}</p>`;

    // Procesar imágenes adjuntas
    msg.attachments.forEach((attachment) => {
        htmlContent += `<img src="${attachment.url}" alt="Attachment"/>`;
    });

    // Procesar embeds
    if (msg.embeds.length > 0) {
        msg.embeds.forEach((embed) => {
            htmlContent += `<div style="background-color: #36393e; color: #ffffff; border: 1px solid ${embed.hexColor}; padding: 10px; margin: 10px;">`; // Contenedor para cada embed
            htmlContent += `<p>Embed: ${embed.title}</p>`;

            if (embed.description) {
                htmlContent += `<p>${embed.description}</p>`;
            }

            if (embed.image) {
                htmlContent += `<img src="${embed.image.url}" alt="Embed Image"/>`;
            }

            if (embed.thumbnail) {
                htmlContent += `<img src="${embed.thumbnail.url}" alt="Embed Thumbnail"/>`;
            }

            // Procesar campos del embed
            if (embed.fields && embed.fields.length > 0) {
                embed.fields.forEach((field) => {
                    htmlContent += `<p><strong>${field.name}:</strong> ${field.value}</p>`;
                });
            }

            htmlContent += `</div>`; // Cierre del contenedor para cada embed
        });
    }

    htmlContent += `</div>`; // Cierre del contenedor para cada mensaje
}

htmlContent += `</body></html>`;



        fs.writeFileSync(`messages.html`, htmlContent);

        const file = new AttachmentBuilder(`messages.html`);
        const channelVentasId = "1169056905981853776"; // ID del canal de ventas
const channelVentas = await client.channels.fetch(channelVentasId);

// Obtener el canal actual
const channelActual = interaction.channel;

// Asegurarse de que channelVentas esté definido
if (channelVentas) {
  // Enviar el nombre del canal actual al canal de ventas
  channelVentas.send(`Registro del ${channelActual.name}`);

  // Enviar el archivo al canal de ventas
  const file = 'messages.html'; // Reemplaza con la ruta de tu archivo
  channelVentas.send({ files: [file] });

  // Eliminar el canal actual
  channelActual.delete()
    .then(() => console.log(`Canal ${channelActual.name} eliminado.`))
    .catch(error => console.error("Error al intentar eliminar el canal:", error));
} else {
  console.error("No se pudo obtener el canal de ventas.");
}

    }
});
client.login("");
