import {inFn} from "./in";
import * as stream from "stream";
import * as tmp from "tmp";
import * as fs from "fs";

describe('check script', () => {
    let stdin;
    let tempDir;

    beforeEach(() => {
        stdin = new stream.Readable();
        stdin._read = f => f;
        tempDir = tmp.dirSync();
    });

    it('should throw error on missing version', (done) => {
        inFn(stdin)
            .then(fail)
            .catch((error) => {
                expect(error).toEqual('No version specified.');
                done();
            });

        stdin.push('{}\n');
    });

    it('should create git-branch file in with git-branch as content', (done) => {
        process.stdout.write = jest.fn();
        process.argv = ['node-cmd', 'script-file', tempDir.name];

        inFn(stdin).then(() => {
            const content = fs.readFileSync(tempDir.name + '/git-branch');
            expect(content.toString()).toBe('wmf/1.33.0-wmf.17');
            expect(process.stdout.write).toHaveBeenCalledWith('{"version":{"git-branch":"wmf/1.33.0-wmf.17"}}');
            done();
        });

        stdin.push('{"version": {"git-branch": "wmf/1.33.0-wmf.17"}}\n');
    });

    it('should create target directory if it does not exist', (done) => {
        process.stdout.write = jest.fn();
        process.argv = ['node-cmd', 'script-file', tempDir.name + '1'];

        inFn(stdin).then(() => {
            expect(fs.existsSync(tempDir.name + '1')).toBeTruthy();
            done();
        });

        stdin.push('{"version": {"git-branch": "wmf/1.33.0-wmf.17"}}\n');
    });
});