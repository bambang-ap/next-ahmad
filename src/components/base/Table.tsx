import {FC, Fragment} from 'react';

import {Table as TableFlowbite, TableCellProps} from 'flowbite-react';

import {classNames} from '@utils';

type VV = {Cell: FC<TableCellProps>};
type TRenderItem<T, R, V = {}> = (value: MMapValue<T> & V, index: number) => R;

export type TableProps<T, VV = {}> = {
	data: T[];
	header?: string[];
	className?: string;
	renderItem?: TRenderItem<T, JSX.Element, VV>;
	renderItemEach?: TRenderItem<T, JSX.Element | false, VV>;
};

export const Table = <T,>(props: TableProps<T, VV>) => {
	const {data, header, className, renderItem, renderItemEach} = props;

	return (
		<div className={classNames('w-full', className)}>
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
