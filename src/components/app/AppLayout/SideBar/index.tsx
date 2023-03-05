import {signOut} from 'next-auth/react';
import {useRouter} from 'next/router';

import {TMenu} from '@appTypes/app.type';
import {Button, Icon} from '@components';
import {trpc} from '@utils/trpc';

import Sidebar from './component';

export const SideBar = () => {
	const {data} = trpc.menu.get.useQuery({type: 'menu', sorted: true});

	return (
		<Sidebar>
			<RenderMenu data={data} />

			<Sidebar.Item>
				<Button onClick={() => signOut({redirect: false})}>Logout</Button>
			</Sidebar.Item>
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

				if (subMenu?.length > 0) {
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
