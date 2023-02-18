import {getLayout} from '@hoc';

MasterKanban.getLayout = getLayout;

export default function MasterKanban() {
	return (
		<>
			<button>Add</button>
			<table>
				<tr>
					<td>id instuksi kanban</td>
					<td>id customer</td>
					<td>
						<label>id po</label>
						<label>list id items</label>
						<label>list id sppb in</label>
					</td>
					<td>id mesin</td>
				</tr>
			</table>
		</>
	);
}
