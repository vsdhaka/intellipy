const { exec } = require('child_process');
exec('vsce package', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error.message}`);
        return;
    }
    console.log(stdout);
    if (stderr) {
        console.error(`Stderr: ${stderr}`);
    }
});