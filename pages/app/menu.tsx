import {TMenu} from '@appTypes/app.type';
import {getLayout} from '@hoc';
import {useFetchMenu} from '@queries';

const allRole = ['admin', 'user', 'customer'];

export default function Menu() {
	const {data} = useFetchMenu();

	return (
		<>
			<RenderMenu data={data?.data} />
		</>
	);
}

const RenderMenu = ({data}: {data?: TMenu[]}) => {
	return (
		<ul className="ml-6 space-y-2">
			{data?.map(({title, accepted_role, subMenu}) => {
				const roles = accepted_role.split(',');
				return (
					<li key={title}>
						<div className="flex">
							<input className="text-left" defaultValue={title} />
							{allRole.map(role => {
								return (
									<>
										<input type="checkbox" checked={roles.includes(role)} />
										{role}
									</>
								);
							})}
						</div>
						<RenderMenu data={subMenu} />
					</li>
				);
			})}
		</ul>
	);
};

Menu.getLayout = getLayout;
