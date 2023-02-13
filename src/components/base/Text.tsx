export function Text({children}: {children: string}) {
	return (
		<label className="text-app-neutral-10 dark:text-white">{children}</label>
	);
}
