import {useWatch} from 'react-hook-form';

import {FormProps} from '@appTypes/app.type';
import {Icon} from '@baseComps/Icon';
import {BorderTd, BorderTdProps, RootTable as Table} from '@baseComps/Table';
import {decimalValue, unitData} from '@constants';
import {useQtyData} from '@hooks';
import {classNames, numberFormat} from '@utils';

import {FormValue} from './';

const {TBody, THead, Tr} = Table;

export function Td({className, rootClassName, ...props}: BorderTdProps) {
	return (
		<BorderTd
			{...props}
			className={classNames(className)}
			rootClassName={rootClassName}
		/>
	);
}

export default function QtyTable({
	control,
	setValue,
}: FormProps<FormValue, 'control' | 'setValue'>) {
	const {dataList, qtyParser} = useQtyData();

	const titleClassName = 'text-lg text-white';

	const header = dataList.map(([a, , b]) => [a, b]);

	const {type} = useWatch({control});

	return (
		<>
			<Table className="overflow-x-scroll">
				<THead>
					<Tr>
						<Td
							center
							className="w-32"
							rootClassName={classNames(titleClassName, 'bg-zinc-500')}>
							Unit
						</Td>
						{header.map(([category, className]) => (
							<Td
								center
								key={category}
								className="text-lg"
								rootClassName={className}>
								{category}
							</Td>
						))}
					</Tr>
				</THead>
				<TBody>
					{unitData.map(unit => {
						const qtys = qtyParser(unit);
						const isSelected = unit === type;

						return (
							<Tr key={unit}>
								<Td
									className="items-center"
									onClick={() => setValue('type', unit)}
									rootClassName={classNames(
										'cursor-pointer hover:opacity-80',
										titleClassName,
										{
											'bg-green-600': isSelected,
											'bg-zinc-500': !isSelected,
										},
									)}>
									<div className="flex-1">{unit.ucwords()}</div>
									{isSelected && <Icon name="faCheck" />}
								</Td>
								{qtys.map(([, qty, className], index) => (
									<Td
										key={`${unit}${index}`}
										rootClassName={className}
										className="justify-end w-32">
										{!!qty
											? numberFormat(qty, false, decimalValue, decimalValue)
											: '-'}
									</Td>
								))}
							</Tr>
						);
					})}
				</TBody>
			</Table>
		</>
	);
}
