import classNames from 'classnames';
import Link from 'next/link';
import {useRouter} from 'next/router';

import {TMenu} from '@appTypes/app.type';
import {Icon} from '@components';
import {useFetchMenu} from '@queries';

export const SideBar = () => {
	const {data} = useFetchMenu();

	const mappedMenu = data?.data.slice().nest('subMenu', 'id', 'parent_id');

	return <RenderMenu data={mappedMenu} />;
};

const RenderMenu = ({data}: {data?: TMenu[]}) => {
	const {isReady, asPath} = useRouter();

	if (!isReady) return null;

	return (
		<ul>
			{data?.map(({id, title, icon, path, subMenu}) => {
				const pathRedirect = typeof path === 'string' ? path : '';
				const selectedVariant = path === asPath;

				return (
					<li key={id}>
						<Link
							href={pathRedirect}
							className={classNames(
								'flex items-center p-2 text-base font-normal rounded-lg',
								{
									'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white':
										selectedVariant,
									'text-gray-900 dark:text-white': !selectedVariant,
									'hover:bg-gray-100 dark:hover:bg-gray-700': !selectedVariant,
								},
							)}>
							<Icon name={icon} />
							<span className="ml-3">{title}</span>
						</Link>
						{subMenu?.length > 0 && <RenderMenu data={subMenu} />}
					</li>
				);
			})}
		</ul>
	);
};