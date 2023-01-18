import React from 'react';

import {useRouter} from 'next/router';

import {TMenu} from '@appTypes/app.type';
import {useFetchMenu} from '@queries';

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
	const {push} = useRouter();

	return (
		<ul className="ml-6 space-y-2">
			{data?.map(({title, path, subMenu}) => {
				const redirect = () => {
					push(path);
				};
				return (
					<li key={title}>
						<button
							className="text-app-neutral-00 text-left"
							onClick={redirect}>
							{title}
						</button>
						<RenderMenu data={subMenu} />
					</li>
				);
			})}
		</ul>
	);
};
