import {getLayout} from '@hoc';

/**
 * PT A di input sbg data `customer`
 * PT A ngirim PO yang akan di input di menu `po customer`
 * PT A ngirim barang yg di cantumkan di PO beserta `Surat jalan` & nomor PO sebelumnya dan akan diinput oleh admin di menu `SPPB In`
 * PT IMI melakukan proses, lalu barang dikirim kembali beserta `surat jalan` yang di generate di menu `SPPB Out`
 */

export default function POCustomer() {
	return (
		<>
			<div>
				<button>Add PO customer</button>
				<button>Export Excel</button>
			</div>
			<table className="table-auto">
				<thead>
					<tr>
						<td>ID</td>
						<td>Customer</td>
						<td>Detail PO</td>
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

POCustomer.getLayout = getLayout;
