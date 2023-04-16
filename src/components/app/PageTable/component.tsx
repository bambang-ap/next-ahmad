import {useRef} from 'react';

import {TUser} from '@appTypes/app.type';
import {Button, Modal, ModalRef, Text} from '@components';
import {BodyArrayKey, defaultErrorMutation} from '@constants';
import {copyToClipboard, generatePDF} from '@utils';
import {trpc} from '@utils/trpc';

type RenderTableCellProps = {
	item: any;
	keys: BodyArrayKey<any>;
};

export function RenderTableCell({item, keys}: RenderTableCellProps) {
	const [, useQuery, finder] = keys;

	// @ts-ignore
	const {data} = useQuery();
	const h = finder?.(item, data);

	return <Text>{h}</Text>;
}

export function UserTokenCopy(user: TUser) {
	const {data: dataToken} = trpc.user_login.getToken.useQuery<any, string>(
		user.id,
	);

	if (!dataToken) return null;

	return <Button onClick={() => copyToClipboard(dataToken)}>Copy token</Button>;
}

export function QRUserLogin(user: TUser) {
	const tagId = `qr-user-${user.id}`;
	const modalRef = useRef<ModalRef>(null);
	const {mutate} = trpc.user_login.generate.useMutation(defaultErrorMutation);
	const {data} = trpc.qr.useQuery<any, string>(user.id);
	const {data: dataToken, refetch} = trpc.user_login.getToken.useQuery<
		any,
		string
	>(user.id);

	if (!data) return null;

	function generate() {
		modalRef.current?.show();
		mutate(user.id, {
			onSuccess: () => {
				refetch();
				alert('Berhasil');
			},
		});
	}

	return (
		<>
			<Button onClick={generate}>Generate</Button>
			<Modal title="QR Cutomer Login" ref={modalRef}>
				<div id={tagId}>
					<img alt="" src={data} />
				</div>
				{dataToken && (
					<div className="flex gap-2">
						<Button
							className="flex-1"
							onClick={() => generatePDF(tagId, 'customer')}>
							Print
						</Button>
						<Button
							className="flex-1"
							onClick={() => copyToClipboard(dataToken)}>
							Copy token
						</Button>
					</div>
				)}
			</Modal>
		</>
	);
}
