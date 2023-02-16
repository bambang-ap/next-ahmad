import {forwardRef, useImperativeHandle, useState} from 'react';

import {Modal as ModalFlowbite} from 'flowbite-react';

export type ModalRef = {
	show: (callback?: () => Promise<void>) => void;
	hide: (callback?: () => Promise<void>) => void;
};
export type ModalProps = {
	children: JSX.Element;
	title?: string;
	visible?: boolean;
	renderFooter?: () => JSX.Element;
};

export const Modal = forwardRef<ModalRef, ModalProps>(function ModalComponent(
	props,
	ref,
) {
	const {children, title, renderFooter, visible: initVisible = false} = props;
	const [visible, setVisible] = useState(initVisible);

	const {hide, show}: Pick<ModalRef, 'hide' | 'show'> = {
		async hide(callback) {
			if (!callback) return setVisible(false);

			await callback?.();
			return setVisible(false);
		},
		async show(callback) {
			if (!callback) return setVisible(true);

			await callback?.();
			return setVisible(true);
		},
	};

	useImperativeHandle(ref, () => {
		return {show, hide};
	});

	if (!visible) return null;

	return (
		<ModalFlowbite show={visible} onClose={() => hide()}>
			<ModalFlowbite.Header className="items-center">
				{title}
			</ModalFlowbite.Header>
			<ModalFlowbite.Body>{children}</ModalFlowbite.Body>
			{renderFooter && (
				<ModalFlowbite.Footer>{renderFooter()}</ModalFlowbite.Footer>
			)}
		</ModalFlowbite>
	);
});
