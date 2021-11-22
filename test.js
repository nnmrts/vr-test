const {
	args: [
		times = 1
	],
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

const allDurations = Object.fromEntries(configFilenames.map(name => [name, []]));

for (let index = 0; index <= times; index++) {

	for (const configFilenameFolder of configFilenames) {
		const path = `./configs/${configFilenameFolder}`;
		const start = performance.now();
		await loadConfig(path);
		const end = performance.now();
		const duration = end - start;
		allDurations[configFilenameFolder].push(duration);

	}
}

const average = (array) => array.reduce((a, b) => a + b, 0) / array.length;

const averages = Object.fromEntries(
	Object.entries(allDurations)
		.map(([name, durations]) => [name, `${average(durations).toFixed(4)}ms`])
);

console.table(averages);