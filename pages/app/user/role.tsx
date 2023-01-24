import {getLayout} from '@hoc';
import {useFetchRole} from '@queries';

export default function User() {
	const {data} = useFetchRole();

	return (
		<div className="overflow-x-auto w-full">
			<table className="table-auto overflow-scroll w-full">
				<thead>
					<tr>
						<th>Role</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					{data?.data.map(({id, name}) => {
						return (
							<tr key={id}>
								<td>{name}</td>
								<td>
									<div>
										<button>Edit</button>
										<button>Delete</button>
									</div>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}

User.getLayout = getLayout;
