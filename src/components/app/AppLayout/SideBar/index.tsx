import {useRouter} from 'next/router';

import {TMenu} from '@appTypes/app.type';
import {Icon} from '@components';
import {useFetchMenu} from '@queries';

import Sidebar from './component';

export const SideBar = () => {
	const {data} = useFetchMenu();

	const mappedMenu = data?.data.slice().nest('subMenu', 'id', 'parent_id');

	return (
		<Sidebar>
			<RenderMenu data={mappedMenu} />
		</Sidebar>
	);
};

const RenderMenu = ({data}: {data?: TMenu[]}) => {
	const {isReady, asPath} = useRouter();

	if (!isReady) return null;

	return (
		<>
			{data?.map(({id, title, icon, path, subMenu}) => {
				const isSelected = path === asPath;

				if (subMenu.length > 0) {
					return (
						<Sidebar.Collapse
							key={id}
							label={title}
							href={path}
							icon={<Icon name={icon} />}>
							<RenderMenu data={subMenu} />
						</Sidebar.Collapse>
					);
				}

				return (
					<Sidebar.Item
						key={id}
						href={path}
						icon={<Icon name={icon} />}
						className={isSelected ? 'wasd' : 'jklm'}>
						{title}
					</Sidebar.Item>
				);
			})}
		</>
	);
};
