import {useRef} from "react";

import {Icon, Modal, ModalRef, Text} from "@components";

export function useLoader() {
	const modalRef = useRef<ModalRef>(null);

	const {hide, show} = modalRef.current ?? {};

	return {
		show,
		hide,
		component: (
			<Modal disableBackdropClick ref={modalRef}>
				<div className="w-full flex justify-center items-center gap-2">
					<Icon name="faSpinner" className="animate-spin" />
					<Text>Harap Tunggu...</Text>
				</div>
			</Modal>
		),
	};
}
