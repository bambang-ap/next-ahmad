import {PropsWithChildren, useState} from 'react';

import {LinkProps} from 'next/link';
import {useRouter} from 'next/router';

import {Icon} from '@components';
import {classNames} from '@utils';

const Sidebar = Object.assign(SidebarComponent, {
	Item: SidebarItem,
	Collapse: SidebarCollapse,
});

SidebarComponent.displayName = 'Sidebar';

export default Sidebar;

function SidebarComponent({children}: PropsWithChildren) {
	return (
		<aside className="overflow-y-auto h-full p-4">
			<ul>{children}</ul>
		</aside>
	);
}

const itemClassName =
	'flex items-center gap-x-2 text-gray-900 dark:text-white py-2 w-full';

type ItemProps = PropsWithChildren<{
	icon?: JSX.Element;
	href?: LinkProps['href'];
	className?: string;
}>;

function SidebarItem({children, className, icon, href}: ItemProps) {
	function renderItem() {
		return (
			<>
				{icon}
				<label className="flex-1 cursor-pointer	flex text-left">
					{children}
				</label>
			</>
		);
	}

	if (!href) {
		return (
			<li className={classNames(itemClassName, className)}>{renderItem()}</li>
		);
	}

	return (
		<li>
			<BtnMenu className={className} href={href}>
				{renderItem()}
			</BtnMenu>
		</li>
	);
}

function SidebarCollapse({
	icon,
	href,
	label,
	children,
	className,
}: ItemProps & {label: string}) {
	const {push} = useRouter();
	const [visible, setVisible] = useState(false);

	return (
		<li>
			<button
				className={classNames(itemClassName, className)}
				onClick={() => {
					setVisible(e => !e);
					if (href) push(href, undefined, {shallow: true});
				}}>
				{icon}
				<label className="flex-1 cursor-pointer	flex text-left">{label}</label>
				<Icon name={visible ? 'faChevronUp' : 'faChevronDown'} />
			</button>
			{visible && <ul className="ml-4">{children}</ul>}
		</li>
	);
}

const BtnMenu = ({className, href, children}: Omit<ItemProps, 'icon'>) => {
	const {push} = useRouter();

	return (
		<button
			className={classNames(itemClassName, className)}
			onClick={() => {
				if (href) push(href, undefined, {shallow: true});
			}}>
			{children}
		</button>
	);
};
