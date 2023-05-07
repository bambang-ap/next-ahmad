import {forwardRef, Ref, useImperativeHandle, useRef} from "react";

import QrReader, {QRResult} from "react-qr-scanner";

import {Modal, ModalProps, ModalRef} from "@components";

export type ScannerProps = {
	onRead?: (text: string) => void;
} & Omit<ModalProps, "children">;

export const Scanner = forwardRef(ScannerComponent);

function ScannerComponent(
	{onRead, ...props}: ScannerProps,
	ref: Ref<ModalRef | null>,
) {
	const modalRef = useRef<ModalRef>(null);

	function handleScannerLoad(result: QRResult) {
		if (result?.text) {
			modalRef.current?.hide();
			onRead?.(result.text);
		}
	}

	useImperativeHandle(ref, () => modalRef.current);

	return (
		<Modal ref={modalRef} {...props}>
			<div className="flex justify-center">
				<QrReader
					delay={1000}
					style={{height: 350, width: 350}}
					onScan={handleScannerLoad}
				/>
			</div>
		</Modal>
	);
}
