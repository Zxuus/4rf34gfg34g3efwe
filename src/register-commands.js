require("dotenv").config();
const { REST } = require("@discordjs/rest");
const { Routes, ApplicationCommandOptionType } = require("discord-api-types/v10");

const commands = [
    {
        name: "finish",
        description: "Acaba el checkout.",
        options: [
            {
                name: "user",
                description: "Quitarle acceso al canal al usuario.",
                type: ApplicationCommandOptionType.User,
                required: true,
            },
        ],
        defaultPermission: false,
    },
    {
        name: "close",
        description: "Acaba el canal del checkout y lo envia en el registro.",
        defaultPermission: false,
    },
];

const rest = new REST({ version: "10" }).setToken("");

(async () => {
    try {
        console.log("Revisando los comandos...");

        // Obtén el client ID y el guild ID desde tus variables de entorno
        const clientId = "1184091348903661629";
        const guildId = "1169046512236515340";

        // Registra los comandos con los permisos predeterminados (defaultPermission: false)
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log("Comandos revisados.");
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
})();
