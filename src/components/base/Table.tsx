import {Fragment} from 'react';

type TableProps<T> = {
	data: T[];
	header?: string[];
	renderItem: (...args: Parameters<GetProps<Array<T>['mmap']>>) => JSX.Element;
	renderItemEach?: (
		...args: Parameters<TableProps<T>['renderItem']>
	) => JSX.Element | false;
};

export const Table = <T,>(props: TableProps<T>) => {
	const {data, header, renderItem, renderItemEach} = props;

	return (
		<div className="w-full">
			<table className="table-auto border-separate border border-slate-500">
				{header && (
					<thead>
						<tr>
							{header.map(head => (
								<th key={head}>{head}</th>
							))}
						</tr>
					</thead>
				)}
				<tbody>
					{data.mmap((item, index) => {
						const isRenderEach = renderItemEach?.(item, index);
						return (
							<Fragment key={index}>
								<tr>{renderItem(item, index)}</tr>
								{isRenderEach && renderItemEach && (
									<tr>{renderItemEach(item, index)}</tr>
								)}
							</Fragment>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};
