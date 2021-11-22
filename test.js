const {
	errors: {
		NotFound
	},
	readTextFile,
	stat
} = Deno;

const names = ["scripts", "velociraptor"];
const extensions = ["yaml", "yml", "json", "ts", "js", "mjs"];

const configFilenames = names
	.map((name) => {
		return extensions.map(extension => `${name}.${extension}`);
	})
	.flat();

const loadConfig = async (cwd) => {
	for (const configFilename of configFilenames) {
		try {
			const path = `${cwd}/${configFilename}`;

			await stat(path);

			return readTextFile(path);
		} catch (error) {
			if (!(error instanceof NotFound)) {
				throw error;
			}
		}
	}
}

for (const configFilenameFolder of configFilenames) {
	const path = `./configs/${configFilenameFolder}`;
	const start = performance.now();
	await loadConfig(path);
	const end = performance.now();

	console.log(`${configFilenameFolder} took ${(end - start).toFixed(4)}ms.`)
}