import {getLayout} from '@hoc';
import {useFetchRole} from '@queries';

export default function User() {
	const {data} = useFetchRole();

	console.log(data);

	return (
		<div className="overflow-x-auto w-full">
			<table className="table-auto overflow-scroll w-full">
				<thead>
					<tr>
						<th>ID</th>
						<th>Role</th>
						<th>Role</th>
						<th>Role</th>
						<th>Role</th>
						<th>Role</th>
						<th>Role</th>
						<th>Role</th>
						<th>Role</th>
						<th>Role</th>
						<th>hgjdsfggjh</th>
					</tr>
				</thead>
				<tbody>
					{data?.data.map(({id, name}) => {
						return (
							<tr>
								<td>{id}</td>
								<td>{name}</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}

User.getLayout = getLayout;
