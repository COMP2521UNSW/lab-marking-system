function removePrefix(s: string, prefix: string) {
	if (s.startsWith(prefix)) {
		return s.slice(prefix.length);
	} else {
		return s;
	}
}

export { removePrefix };
