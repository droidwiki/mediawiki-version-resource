import * as http from "http";
import * as https from "https";
import * as readline from "readline";

const apiRequestPath = '/w/api.php?action=query&meta=siteinfo&siprop=general&formatversion=2&format=json';

function client(url) {
    if (url.toString().indexOf("https") === 0){
        return https;
    }
    return http;
}

export function check(stdin) {
    const rl = readline.createInterface({
        input: stdin,
        crlfDelay: Infinity
    });

    return new Promise((resolve, reject) => {
        rl.on('line', (line) => {
            const input = JSON.parse(line);
            if (!input.source.mediawikiUrl) {
                reject('The mediawiki URL is a required source config.');
                return;
            }

            const discoveredVersions = [];
            if (input.version && input.version['git-branch']) {
                discoveredVersions.push(input.version);
            }
            const url = new URL(apiRequestPath, new URL(input.source.mediawikiUrl));
            client(url).get(url.toString(), (res) => {
                if (res.statusCode !== 200) {
                    process.stdout.write(JSON.stringify(discoveredVersions));
                    reject();
                    return;
                }
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    const apiResponse = JSON.parse(data);
                    if (!apiResponse.query.general['git-branch']) {
                        process.stdout.write(JSON.stringify([]));
                        resolve();
                    }
                    const version = {'git-branch': apiResponse.query.general['git-branch']};
                    if (!discoveredVersions.find((registeredVersion) => registeredVersion['git-branch'] === version['git-branch'])) {
                        discoveredVersions.push(version);
                    }
                    process.stdout.write(JSON.stringify(discoveredVersions));
                    resolve();
                });
            }).on('error', (error) => {
                reject(error);
            });
        });

    });
}
