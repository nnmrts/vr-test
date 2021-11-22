export default {
	scripts: {
		test: {
			cmd: "deno test -Ar",
			desc: "Runs the tests",
			gitHook: "pre-push"
		},
		format: {
			cmd: "FILES=$(git diff --cached --name-only --diff-filter=ACMR \"*.ts\") && [ -z \"$FILES\" ] && exit 0 && echo \"$FILES\" | xargs deno fmt && echo \"$FILES\" | xargs git add",
			desc: "Formats staged files",
			gitHook: "pre-commit"
		},
		commitlint: {
			cmd: "npx commitlint -x @commitlint/config-conventional -e",
			desc: "Checks commit messages format",
			gitHook: "commit-msg"
		}
	}
}