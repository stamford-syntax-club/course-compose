export const limitWords = (text: string, limit: number) => {
	const words = text.split(/\s+/);
	if (words.length > limit) {
		return `${words.slice(0, limit).join(" ")}...`;
	}
	return text;
};
