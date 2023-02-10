import React from 'react';

import {useRouter} from 'next/router';

import {TMenu} from '@appTypes/app.type';
import {Button, ButtonProps, Icon} from '@components';
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
	const {push, isReady, asPath} = useRouter();

	if (!isReady) return null;

	return (
		<div className="ml-6 space-y-2">
			{data?.map(({title, icon, path, subMenu}) => {
				const selectedVariant: ButtonProps['variant'] =
					path === asPath ? 'primary' : 'secondary';
				const redirect = () => {
					if (path) push(path);
				};
				return (
					<div className="flex flex-col w-full" key={title}>
						<Button variant={selectedVariant} icon={icon} onClick={redirect}>
							{title}
						</Button>
						{subMenu?.length > 0 && (
							<div className="mt-2">
								<RenderMenu data={subMenu} />
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};
