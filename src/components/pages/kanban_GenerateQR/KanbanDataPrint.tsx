import {RenderPerKanban} from "./KanbanCard";

export function KanbanDataPrint({
	idKanban,
}: {
	idKanban: string[];
}): (JSX.Element | null)[] {
	return idKanban.map(id => {
		const renderedElement = <RenderPerKanban idKanban={id} />;

		if (!renderedElement) return null;

		return (
			<div key={id} className="w-1/2 p-4 flex flex-col">
				{renderedElement}
			</div>
		);
	});
}
