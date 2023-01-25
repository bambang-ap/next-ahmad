import React from 'react';

import {useRouter} from 'next/router';

import {TMenu} from '@appTypes/app.type';
import {Icon} from '@components';
import {useFetchMenu} from '@queries';

export const SideBar = () => {
	const {data} = useFetchMenu();

	const mappedMenu = data?.data.slice().nest('subMenu', 'id', 'parent_id');

	return (
		<aside className="w-1/5 h-full" aria-label="Sidebar">
			<div className="px-3 py-4 -ml-6 overflow-y-auto bg-gray-50 dark:bg-gray-800 h-full">
				<RenderMenu data={mappedMenu} />
			</div>
		</aside>
	);
};

const RenderMenu = ({data}: {data?: TMenu[]}) => {
	const {push, pathname} = useRouter();

	return (
		<div className="ml-6 space-y-2">
			{data?.map(({title, icon, path, subMenu}) => {
				const selectedClassName =
					path === pathname ? 'border border-app-accent-04' : '';
				const redirect = () => {
					if (path) push(path);
				};
				return (
					<div className="flex flex-col w-full" key={title}>
						<button
							onClick={redirect}
							className={`${selectedClassName} items-center rounded p-2 flex cursor-pointer`}>
							<Icon className="text-app-neutral-00 mr-2" name={icon} />
							<div className="text-app-neutral-00 text-left">{title}</div>
						</button>
						{subMenu?.length > 0 && <RenderMenu data={subMenu} />}
					</div>
				);
			})}
		</div>
	);
};
