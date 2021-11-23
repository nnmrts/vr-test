# vr-test

This is a benchmark and test of a rewrite of vr's `loadConfig` function. Its purpose is to show the impact of allowing more file extensions for config files. The example config file used here is taken from [jurassiscripts/velociraptor/scripts.yml](https://github.com/jurassiscripts/velociraptor/blob/main/scripts.yml) and is converted to all currently supported and proposed formats under the [`configs`](./configs) folder.

## How it works

The [`test.js`](./test.js) module contains three main functions, `loadConfig`, `loadConfigNet` and `loadConfigNetNaive`, which all basically do the same things in the following order:

- Given a set of possible file names and file extensions, find out all possible combinations.
- For every single one of these combinations, do this:
  - go into a folder called `<name>.<extension>`.
  - try to find the file `<name>.<extension>` by looping through all possible combinations **in the same order**
  - if found, read the text content of the file and return it

The module will show you the average time it took finding and reading these files for a specified number of times and a total average of these averages.

The `test-multiple.js` file can be used to easily display the averages of different file extension configurations. Calling:

```sh
deno run -A test-multiple.js --extensions=yaml,json,js
```

is basically the short form of calling

```sh
deno run -A test.js --extensions=yaml
deno run -A test.js --extensions=yaml,json
deno run -A test.js --extensions=yaml,json,js
```

and then displaying all these averages in a table similar to `test.js`.

## Usage

```sh
deno run -A test.js
```

```sh
deno run -A test-multiple.js
```

## Options

### `--times=<number>`

Specifies the number of times the module should do the same thing. A higher number here obviously gives a better average. Default is `1`.

### `--net`

Specifies if the module should use `https://raw.githubusercontent.com/nnmrts/vr-test/main/configs` as working directory instead of the local [`configs`](./configs) folder. This also fundamentally changes how the module will request files, using `fetch` instead of file system functions for example.

### `--naive`

Specifies if the module should use naive, sequential fetching of online files. Does nothing if `--net` is not specified

### `--extensions=<comma-separated-list-of-strings>`

Specifies which file extensions are "allowed" and taken into consideration. The order matters a lot, since the local and naive online versions of this module work sequentially. Default is `yaml,yml,json,ts,js,mjs`.
