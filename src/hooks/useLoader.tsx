import {useRef} from "react";

import {Icon, Modal, ModalRef, Text} from "@components";
import {mutateCallback} from "@utils";

export function useLoader() {
	const modalRef = useRef<ModalRef>(null);

	const {hide, show} = modalRef.current ?? {};

	const mutateOpts = mutateCallback({hide, show});

	return {
		show,
		hide,
		mutateOpts,
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
