const { execSync } = require('child_process');
const testCommands = require('./path/to/test-commands.json');

const scriptName = process.argv[2]; // Get the script name from CLI arguments

if (!scriptName || typeof scriptName !== 'string') {
    console.log('Invalid or missing script name.');
    process.exit(1);
}

const commandObj = testCommands.commands.find(cmd => cmd.name === scriptName);

if (commandObj) {
    console.log(`Running command: ${commandObj.command}`);
    try {
        execSync(commandObj.command, { stdio: 'inherit' });
    } catch (error) {
        console.error(`Error executing command: ${error}`);
        process.exit(1);
    }
} else {
    console.log(`Command ${scriptName} not found.`);
    process.exit(1);
}