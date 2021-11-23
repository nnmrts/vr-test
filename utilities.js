export const formatMsTable = (object) => {
	return Object.fromEntries(
		Object.entries(object)
			.map(([key, ms]) => [key, `${ms.toFixed(4)} ms`])
	);
};