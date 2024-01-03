import {useWatch} from 'react-hook-form';
import {useRecoilValue} from 'recoil';

import {FormProps} from '@appTypes/app.type';
import {Button, Text} from '@components';
import {formatAll} from '@constants';
import {PATHS} from '@enum';
import {useRouter} from '@hooks';
import {atomIsMobile} from '@recoil/atoms';
import {classNames, moment} from '@utils';
import {trpc} from '@utils/trpc';

import {DashboardForm} from '.';

export default function TotalCount({control}: FormProps<DashboardForm>) {
	const {filterYear} = useWatch({control});

	const now = moment(`${filterYear}/01/01`);
	const title = `Data Tahun ${now.format('YYYY')}`;

	const {data} = trpc.dashboard.totalCount.useQuery({
		filterFrom: now.format(formatAll),
		filterTo: now.endOf('year').format(formatAll),
	});
	const {push} = useRouter();

	const isMobile = useRecoilValue(atomIsMobile);

	return (
		<>
			<div className="text-center text-xl font-bold font-bachshrift mb-4">
				{title}
			</div>
			<div className="-m-1 flex flex-wrap md:-m-2">
				{data?.map(({path, bgColor, image, title, count = 0}, i) => {
					function navigate() {
						push(path! as PATHS);
					}
					return (
						<div
							key={i}
							className={classNames('flex flex-wrap p-1 rounded-md', {
								['w-full']: isMobile,
								['w-1/4']: !isMobile,
							})}>
							<div
								style={{backgroundColor: bgColor}}
								className={classNames(
									'flex flex-col flex-1 justify-between',
									'h-[150px]',
								)}>
								<div className="flex p-4 justify-between items-center">
									<div className="flex flex-col flex-1">
										<Text className="!text-white font-bold text-4xl">
											{count}
										</Text>
										<Text className="!text-white text-lg">{title}</Text>
									</div>
									<div className="w-[75px] opacity-50">
										<img alt="" src={image} />
									</div>
								</div>
								{path && (
									<div className="flex bg-black bg-opacity-10">
										<Button
											icon="faCircleArrowRight"
											className="flex-1 !text-white flex-row-reverse"
											variant="text"
											onClick={navigate}>
											More Info
										</Button>
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</>
	);
}
