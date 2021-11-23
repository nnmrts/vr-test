import { stripAnsi } from "https://deno.land/x/gutenberg@0.1.5/ansi/strip/mod.ts";
import { formatMsTable } from "./utilities.js";

const {
	args,
	run
} = Deno;

const extensibleArgs = [
	"--extensions=yaml,yml,json,ts,js,mjs",
	...args,
].reverse();

const extensions = extensibleArgs.find((arg) => arg.startsWith("--extensions=")).replace("--extensions=", "").split(",");

const averages = {};

for (let index = 0; index < extensions.length; index++) {
	console.log(index);
	const currentExtensions = extensions.slice(0, index + 1);
	const currentExtensionsString = extensions.slice(0, index + 1).join(",");
	const extensionsArg = `--extensions=${currentExtensionsString}`;

	const process = run({
		cmd: ["deno", "run", "-A", "test.js", "--no-format", "--no-results", "--times=100", ...extensibleArgs, extensionsArg],
		stdout: "piped"
	});

	const decoder = new TextDecoder();

	const average = Number(
		stripAnsi(
			decoder.decode(await process.output()).trim()
		)
	);

	process.close();

	averages[currentExtensionsString] = average;
}

console.table(formatMsTable(averages));