import {forwardRef, ReactNode, useImperativeHandle, useState} from 'react';

import {Modal as ModalFlowbite} from 'flowbite-react';
import {FlowbiteSizes} from 'flowbite-react/lib/esm/components/Flowbite/FlowbiteTheme';

export type ModalRef = {
	show: (callback?: () => Promise<void>) => void;
	hide: (callback?: () => Promise<void>) => void;
};
export type ModalProps = {
	children: ReactNode;
	title?: string;
	visible?: boolean;
	renderFooter?: false | (() => JSX.Element);
	size?: keyof FlowbiteSizes;
};

export const Modal = forwardRef<ModalRef, ModalProps>(function ModalComponent(
	props,
	ref,
) {
	const {
		children,
		title,
		renderFooter,
		visible: initVisible = false,
		size: modalSize,
	} = props;
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
		<ModalFlowbite size={modalSize} show={visible} onClose={() => hide()}>
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
