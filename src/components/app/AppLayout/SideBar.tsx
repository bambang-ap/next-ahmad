import React from 'react';

import {useFetchMenu} from '@queries';

import {TMenu} from '@appTypes/app.type';

export const SideBar = () => {
	const {data} = useFetchMenu();

	return (
		<aside className="w-1/5 h-full" aria-label="Sidebar">
			<div className="px-3 py-4 -ml-6 overflow-y-auto bg-gray-50 dark:bg-gray-800 h-full">
				<RenderMenu data={data?.data} />
			</div>
		</aside>
	);
};

const RenderMenu = ({data}: {data?: TMenu[]}) => {
	return (
		<ul className="ml-6 space-y-2">
			{data?.map(({title, subMenu}) => {
				return (
					<li key={title}>
						<span className="flex-1 ml-3 text-app-neutral-00 whitespace-nowrap">
							{title}
						</span>
						<RenderMenu data={subMenu} />
					</li>
				);
			})}
		</ul>
	);
};
