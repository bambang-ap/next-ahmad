import React, {forwardRef, useImperativeHandle, useState} from 'react';

import {Icon} from './Icon';

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
		<>
			<div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
			<div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
				<div className="relative w-auto my-6 mx-auto max-w-3xl">
					<div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
						<div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
							<h3 className="text-3xl font-semibold">{title}</h3>
							<Icon onClick={() => hide()} name="faClose" />
						</div>
						<div className="max-h-[200px] overflow-auto">
							<div className="relative p-6 flex-auto">{children}</div>

							{renderFooter && (
								<div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
									{renderFooter()}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
});
