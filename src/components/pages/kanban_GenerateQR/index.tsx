import {useEffect, useRef, useState} from "react";

import {Button, Icon, Modal, ModalRef, Text} from "@components";
import {generatePDF} from "@utils";

import {RenderPerKanban} from "./KanbanCard";

export function KanbanGenerateQR({
	idKanban,
	...props
}: {
	idKanban: string[];
	className?: string;
	transform?: boolean;
	withButton?: boolean;
}) {
	const modalRef = useRef<ModalRef>(null);
	const tagId = `data-${idKanban}`;

	const [visible, setVisible] = useState(false);

	const {
		className = "h-0 overflow-hidden -z-10 fixed",
		// className = "",
		withButton = true,
	} = props;

	function showModal() {
		modalRef.current?.show();
	}

	function genPdf() {
		if (!visible) return;

		setTimeout(async () => {
			await generatePDF(tagId, "kanban");
			modalRef.current?.hide();
		}, 2500);
	}

	useEffect(genPdf, [visible]);

	return (
		<>
			<Modal ref={modalRef} onVisibleChange={setVisible}>
				<div className="w-full flex justify-center items-center gap-2">
					<Icon name="faSpinner" className="animate-spin" />
					<Text>Harap Tunggu...</Text>
				</div>
				<div className={className}>
					<div id={tagId} className="flex flex-wrap w-[800px]">
						{idKanban.map(id => (
							<div key={id} className="w-full p-4 flex flex-col">
								{/* <div key={id} className="w-1/2 p-4 flex flex-col"> */}
								<RenderPerKanban idKanban={id} />
							</div>
						))}
					</div>
				</div>
			</Modal>
			{withButton && <Button icon="faPrint" onClick={showModal} />}
		</>
	);
}
