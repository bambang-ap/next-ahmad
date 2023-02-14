import {FC, Fragment} from 'react';

import {Table as TableFlowbite, TableCellProps} from 'flowbite-react';

type TRenderItem<T, R> = (
	value: MMapValue<T> & {Cell: FC<TableCellProps>},
	index: number,
) => R;

export type TableProps<T> = {
	data: T[];
	header?: string[];
	renderItem?: TRenderItem<T, JSX.Element>;
	renderItemEach?: TRenderItem<T, JSX.Element | false>;
};

export const Table = <T,>(props: TableProps<T>) => {
	const {data, header, renderItem, renderItemEach} = props;

	return (
		<div className="w-full">
			<TableFlowbite striped>
				{header && (
					<TableFlowbite.Head>
						{header.map(head => (
							<TableFlowbite.HeadCell key={head}>{head}</TableFlowbite.HeadCell>
						))}
					</TableFlowbite.Head>
				)}
				<TableFlowbite.Body>
					{data.mmap((item, index) => {
						const itemWithCell = {...item, Cell: TableFlowbite.Cell};
						const isRenderEach = renderItemEach?.(itemWithCell, index);

						return (
							<Fragment key={index}>
								<TableFlowbite.Row>
									{renderItem?.(itemWithCell, index)}
								</TableFlowbite.Row>
								{isRenderEach && renderItemEach && (
									<TableFlowbite.Row>
										{renderItemEach(itemWithCell, index)}
									</TableFlowbite.Row>
								)}
							</Fragment>
						);
					})}
				</TableFlowbite.Body>
			</TableFlowbite>
		</div>
	);
};
