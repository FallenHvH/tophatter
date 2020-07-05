const { readdirSync } = require("fs");
var mdlCnt = 0
const ascii = require("ascii-table");
let table = new ascii("Commands");
table.setHeading("Catagory", "Command", "Load status");

module.exports = (client) => {
    readdirSync("./commands/").forEach(dir => {
        const commands = readdirSync(`./commands/${dir}/`).filter(file => file.endsWith(".js"));
    
        for (let file of commands) {
            let pull = require(`../commands/${dir}/${file}`);
    
            if (pull.name) {
                client.commands.set(pull.name, pull);
                table.addRow(dir, file, '✅  | Loaded');
            } else {
                table.addRow(dir, file, `❌  | Error`);
                continue;
            }
    
            mdlCnt++
            if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(alias => client.aliases.set(alias, pull.name));
        }
    });


    console.log(table.toString());
    console.log(`LOADED A TOTAL OF ${mdlCnt} MODULES`)
}