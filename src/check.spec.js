import {check} from "./check";
import * as http from "http";
import * as stream from "stream";

describe('check script', () => {
    let server;
    let port;
    let stdin;
    let response;

    beforeEach((done) => {
        stdin = new stream.Readable();
        stdin._read = f => f;
        server = http.createServer((req, res) => {
            expect(req.url).toBe('/w/api.php?action=query&meta=siteinfo&siprop=general&formatversion=2&format=json');
            res.write(response);
            res.end();
        });
        server.listen(0, () => {
            port = server.address().port;
            done();
        });
    });

    afterEach(() => {
        server.close();
    });

    it('should throw error on missing mediawiki URL', (done) => {
        check(stdin)
            .then(fail)
            .catch((error) => {
                expect(error).toEqual('The mediawiki URL is a required source config.');
                done();
            });

        stdin.push('{"source": {}}\n');
    });

    it('should return current version if no new versions are available', (done) => {
        response = JSON.stringify({"batchcomplete": true, "query": {"general": {"git-branch": "wmf/1.33.0-wmf.17"}}});
        process.stdout.write = jest.fn();

        check(stdin).then(() => {
            expect(process.stdout.write).toHaveBeenCalledWith('[{"git-branch":"wmf/1.33.0-wmf.17"}]');
            done();
        });

        stdin.push('{"version": {"git-branch": "wmf/1.33.0-wmf.17"}, "source": {"mediawikiUrl": "http://localhost:' + port + '"}}\n');
    });

    it('should return empty list if no versions available', (done) => {
        response = JSON.stringify({"batchcomplete": true, "query": {"general": {}}});
        process.stdout.write = jest.fn();

        check(stdin).then(() => {
            expect(process.stdout.write).toHaveBeenCalledWith('[]');
            done();
        }).catch(fail);

        stdin.push('{"source": {"mediawikiUrl": "http://localhost:' + port + '"}}\n');
    });

    it('should return new discovered version', (done) => {
        response = JSON.stringify({"batchcomplete": true, "query": {"general": {"git-branch": "wmf/1.33.0-wmf.18"}}});

        check(stdin).then(() => {
            expect(process.stdout.write).toHaveBeenCalledWith('[{"git-branch":"wmf/1.33.0-wmf.18"}]');
            done();
        });

        stdin.push('{"source": {"mediawikiUrl": "http://localhost:' + port + '"}}\n');
    });

    it('should reject on error', (done) => {
        check(stdin)
            .then(fail)
            .catch((error) => {
                expect(error.message).toEqual('getaddrinfo ENOTFOUND an_url an_url:80');
                done();
            });

        stdin.push('{"source": {"mediawikiUrl": "http://AN_URL"}}\n');
    });
});