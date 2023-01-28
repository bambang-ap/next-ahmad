import {getLayout} from '@hoc';

// Surat jalan dari perusahaan

export default function OutSPPB() {
	return (
		<>
			<div>
				<button>Add SPPB Out</button>
				<button>Export Excel</button>
			</div>
			<table className="table-auto">
				<thead>
					<tr>
						<td>ID</td>
						<td>ID PO</td>
						<td>Produk</td>
						<td>QTY</td>
						<td>Tgl Keluar</td>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>ID</td>
						<td>Name</td>
						<td>Detail PO</td>
						<td>
							<button>Show</button>
							<button>Edit</button>
							<button>Delete</button>
						</td>
					</tr>
				</tbody>
			</table>
			<input type="file" />
			<div>Import data PO customer</div>
			<button>submit</button>
		</>
	);
}

OutSPPB.getLayout = getLayout;
