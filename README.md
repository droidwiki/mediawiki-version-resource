# mediawiki-version Resource

A resource for discovering a new installed MediaWiki version of a MediaWiki wiki.
This resource uses the MediaWiki API to discover new versions and only takes the `git-branch` property of the `siteinfo` query metadata into account.
This property can be a git SHA1 checksum or a name or a tag, depending on what the actual wiki that is discovered uses to deploy MediaWiki.

## Source Configuration

* `mediawikUrl`: The URL of the MediaWiki wiki to track versions of. E.g. `https://de.wikipedia.org`

### Example

With the following resource configuration:

``` yaml
resources:
  - name: mediawiki-version
    type: mediawiki-version-resource
    source:
      mediawikiUrl: https://de.wikipedia.org
```

## Behavior

### `check`: Report the currently installed MediaWiki git-branch

Detects new versions by reading `git-branch` value of the tracked MediaWiki wiki using the public API.

### `in`: Provide the version as a file

Provides the version to the build as a `git-branch` file in the destination.

### `out`: No-Op

Does not do anything.

### Running the tests

The tests have been embedded with the `Dockerfile`; ensuring that the testing environment is consistent across any `docker` enabled platform.
When the docker image builds, the test are run inside the docker container, on failure they will stop the build.

Run the tests with the following command:

```sh
docker build .
```

Alternatively the tests can be run with npm:

```sh
npm test
```

### Contributing

Please make all pull requests to the `master` branch and ensure tests pass locally.
