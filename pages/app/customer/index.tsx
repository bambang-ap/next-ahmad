import {getLayout} from '@hoc';

export default function Customer() {
	return (
		<>
			<div>
				<button>Add customer</button>
				<button>Export Excel</button>
			</div>
			<table className="table-auto">
				<thead>
					<tr>
						<td>ID</td>
						<td>Name</td>
						<td>Address</td>
						<td>Email</td>
						<td>Phone</td>
						<td>Action</td>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>ID</td>
						<td>Name</td>
						<td>Address</td>
						<td>Email</td>
						<td>Phone</td>
						<td>
							<button>SHow</button>
							<button>Edit</button>
							<button>Delete</button>
						</td>
					</tr>
				</tbody>
			</table>
			<input type="file" />
			<div>Import data customer</div>
			<button>submit</button>
		</>
	);
}

Customer.getLayout = getLayout;
