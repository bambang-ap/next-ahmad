import {FC, Fragment} from 'react';

import {Table as Tablee, TableCellProps} from 'flowbite-react';

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
			<Tablee striped>
				{header && (
					<Tablee.Head>
						{header.map(head => (
							<Tablee.HeadCell key={head}>{head}</Tablee.HeadCell>
						))}
					</Tablee.Head>
				)}
				<Tablee.Body>
					{data.mmap((item, index) => {
						const itemWithCell = {...item, Cell: Tablee.Cell};
						const isRenderEach = renderItemEach?.(itemWithCell, index);

						return (
							<Fragment key={index}>
								<Tablee.Row>{renderItem?.(itemWithCell, index)}</Tablee.Row>
								{isRenderEach && renderItemEach && (
									<Tablee.Row>{renderItemEach(itemWithCell, index)}</Tablee.Row>
								)}
							</Fragment>
						);
					})}
				</Tablee.Body>
			</Tablee>
		</div>
	);
};
