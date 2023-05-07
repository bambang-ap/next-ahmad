import {useRef} from "react";

import {FieldValues} from "react-hook-form";

import {
	ControlledComponentProps,
	withReactFormController,
} from "@formController";
import {classNames} from "@utils";

import {Modal, ModalRef} from "./Modal";

export type ImageWithPreviewProps = {
	className?: string;
	modalClassName?: string;
	src: string;
};

export const ImageFormWithPreview = withReactFormController(function <
	F extends FieldValues,
>(props: ControlledComponentProps<F>) {
	const {
		controller: {
			field: {value},
		},
		...rest
	} = props;

	return <ImageWithPreview src={value} {...rest} />;
});

export function ImageWithPreview({
	className,
	modalClassName,
	src,
}: ImageWithPreviewProps) {
	const modalRef = useRef<ModalRef>(null);
	const imageElement = <img alt="" src={src} />;

	return (
		<>
			<div
				onClick={() => modalRef.current?.show()}
				className={classNames("cursor-zoom-in", className)}>
				{imageElement}
			</div>
			<Modal title="Preview" ref={modalRef}>
				<div className={classNames("flex justify-center", modalClassName)}>
					{imageElement}
				</div>
			</Modal>
		</>
	);
}
