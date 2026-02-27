function Mark({ mark, outOf }: { mark: number | null; outOf: number }) {
	return (
		<>
			{mark !== null ? (
				mark
			) : (
				<>
					<span aria-hidden="true">.</span>
					<span className="sr-only" role="text">
						No mark
					</span>
				</>
			)}
			<span aria-hidden="true">/</span>
			<span className="sr-only" role="text">
				out of
			</span>
			{outOf}
		</>
	);
}

export { Mark };
