import { formatMsTable } from "./utilities.js";

const {
	args,
	errors: {
		NotFound
	},
	readTextFile,
	stat
} = Deno;

const extensibleArgs = [
	"--times=1",
	"--extensions=yaml,yml,json,ts,js,mjs",
	...args,
].reverse();

const net = Boolean(extensibleArgs.find((arg) => arg.startsWith("--net")));
const naive = Boolean(extensibleArgs.find((arg) => arg.startsWith("--naive")));
const total = Boolean(extensibleArgs.find((arg) => arg.startsWith("--total")));
const noResults = Boolean(extensibleArgs.find((arg) => arg.startsWith("--no-results")));
const noFormat = Boolean(extensibleArgs.find((arg) => arg.startsWith("--no-format")));
const noTotal = Boolean(extensibleArgs.find((arg) => arg.startsWith("--no-total")));

const format = Boolean(extensibleArgs.find((arg) => arg.startsWith("--format")));
const times = Number(extensibleArgs.find((arg) => arg.startsWith("--times=")).replace("--times=", ""))

const extensions = extensibleArgs.find((arg) => arg.startsWith("--extensions=")).replace("--extensions=", "").split(",");

const names = ["scripts", "velociraptor"];
const configsUrl = "https://raw.githubusercontent.com/nnmrts/vr-test/main/configs";

const configFilenames = names
	.map((name) => {
		return extensions.map(extension => `${name}.${extension}`);
	})
	.flat();

const loadConfig = async (folder) => {
	for (const configFilename of configFilenames) {
		try {
			const path = `./configs/${folder}/${configFilename}`;

			await stat(path);

			return readTextFile(path);
		} catch (error) {
			if (!(error instanceof NotFound)) {
				throw error;
			}
		}
	}
}

const loadConfigNet = async (folder) => {
	const responses = await Promise.allSettled(configFilenames.map(async (configFilename) => {
		const url = `${configsUrl}/${folder}/${configFilename}`;

		const response = await fetch(url);

		if (response.ok) {
			return Promise.resolve(await response.text());
		}
		else {
			return Promise.reject();
		};
	}));

	return responses.find((response) => response.status === "fulfilled")?.value;
}

const loadConfigNetNaive = async (folder) => {
	for (const configFilename of configFilenames) {
		const url = `${configsUrl}/${folder}/${configFilename}`;

		const response = await fetch(url);

		if (response.ok) {
			return response.text();
		}
	}
}

const allDurations = Object.fromEntries(configFilenames.map(name => [name, []]));

const loadFunction = net
	? (
		naive
			? loadConfigNetNaive
			: loadConfigNet
	)
	: loadConfig;

for (let index = 0; index <= times; index++) {
	for (const configFilenameFolder of configFilenames) {
		const start = performance.now();
		await loadFunction(configFilenameFolder);
		const end = performance.now();
		const duration = end - start;
		allDurations[configFilenameFolder].push(duration);
	}
}

const average = (array) => array.reduce((a, b) => a + b, 0) / array.length;

const averages = Object.fromEntries(
	Object.entries(allDurations)
		.map(([name, durations]) => [name, average(durations)])
);

if (!noResults) {
	if (noFormat) {
		console.log(averages);
	}
	else {
		console.table(formatMsTable(averages));
	}
}

const averageOfAverages = average(Object.values(averages));

if (!noTotal) {
	if (noFormat) {
		console.log(averageOfAverages);

	}
	else {
		console.log(`Total average: ${averageOfAverages.toFixed(4)} ms`);
	}
}