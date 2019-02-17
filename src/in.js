import * as readline from "readline";
import * as fs from "fs";

export function inFn(stdin) {
    const rl = readline.createInterface({
        input: stdin,
        crlfDelay: Infinity
    });

    return new Promise((resolve, reject) => {
        rl.on('line', (line) => {
            const input = JSON.parse(line);
            if (!input.version) {
                reject('No version specified.');
                return;
            }

            const version = input.version['git-branch'];
            const directory = process.argv[2];
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory);
            }
            fs.writeFileSync(directory + '/git-branch', version);

            process.stdout.write(JSON.stringify({version: input.version}));
            resolve();
        });
    });
}
