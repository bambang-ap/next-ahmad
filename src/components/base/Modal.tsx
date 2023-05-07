import {forwardRef, ReactNode, useImperativeHandle, useState} from "react";

import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogProps,
	DialogTitle,
} from "@mui/material";

import {Icon} from "./Icon";
import {Text} from "./Text";

export type ModalRef = {
	visible: boolean;
	show: (callback?: () => Promise<void>) => void;
	hide: (callback?: () => Promise<void>) => void;
};
export type ModalProps = {
	children: ReactNode;
	title?: string;
	visible?: boolean;
	renderFooter?: false | (() => JSX.Element);
	size?: DialogProps["maxWidth"];
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

	const {hide, show}: Omit<ModalRef, "visible"> = {
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

	useImperativeHandle(ref, () => ({visible, show, hide}), [visible]);

	if (!visible) return null;

	return (
		<Dialog
			fullWidth
			maxWidth={modalSize}
			open={visible}
			onClose={() => hide()}>
			{title && (
				<DialogTitle>
					<div className="flex justify-between items-center">
						<Text>{title}</Text>
						<Icon
							name="faClose"
							onClick={() => hide()}
							className="text-black text-lg cursor-pointer"
						/>
					</div>
				</DialogTitle>
			)}
			<DialogContent>{children}</DialogContent>
			{renderFooter && <DialogActions>{renderFooter()}</DialogActions>}
		</Dialog>
	);
});
