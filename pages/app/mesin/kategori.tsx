import {FormEventHandler, useContext, useRef} from 'react';

import Sketch from '@uiw/react-color-sketch';
import {FieldValues, useForm, useWatch} from 'react-hook-form';

import {
	FormProps,
	PagingResult,
	TableFormValue,
	TKategoriMesin,
} from '@appTypes/app.type';
import {Button, Form, FormContext, Input, Modal, ModalRef} from '@components';
import {CRUD_ENABLED} from '@enum';
import {
	ControlledComponentProps,
	getLayout,
	withReactFormController,
} from '@hoc';
import {Fields, useTableFilterComponent} from '@hooks';
import {modalTypeParser, nullUseQuery, renderItemAsIs} from '@utils';
import {trpc} from '@utils/trpc';

MesinKategori.getLayout = getLayout;

type FormType = Fields<TKategoriMesin>;

const target = CRUD_ENABLED.MESIN_KATEGORI;

export default function MesinKategori() {
	const modalRef = useRef<ModalRef>(null);

	const {control, reset, watch, clearErrors, handleSubmit} =
		useForm<FormType>();

	const {component, refetch, mutateOpts} = useTableFilterComponent({
		control,
		reset,
		exportRenderItem: renderItemAsIs,
		exportUseQuery: nullUseQuery,
		useQuery,
		header: ['Nama', 'Warna', 'Action'],
		renderItem({Cell, item}) {
			const {id, color} = item;
			return (
				<>
					<Cell>{item.name}</Cell>
					<Cell className="justify-center">
						<div
							className="p-4 rounded-full"
							style={{backgroundColor: color}}
						/>
					</Cell>
					<Cell className="gap-2">
						<Button
							icon="faMagnifyingGlass"
							onClick={() => showModal({...item, type: 'preview'})}
						/>
						<Button
							onClick={() => showModal({...item, type: 'edit'})}
							icon="faEdit"
						/>
						<Button
							// @ts-ignore
							onClick={() => showModal({id, type: 'delete'})}
							icon="faTrash"
						/>
					</Cell>
				</>
			);
		},
	});

	const dataForm = watch();
	const {mutate} = trpc.basic.mutate.useMutation({
		...mutateOpts,
		onSuccess: refetch,
	});

	const {isPreview, modalTitle} = modalTypeParser(
		dataForm.type,
		'Kategori Mesin',
	);

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(({type, id, ...rest}) => {
			const onSuccess = () => {
				modalRef.current?.hide();
				refetch();
			};

			switch (type) {
				case 'edit':
					return mutate({target, type, body: {...rest, id}}, {onSuccess});
				case 'delete':
					return mutate({target, type, body: {id}}, {onSuccess});
				default:
					// @ts-ignore
					return mutate({target, type, body: rest}, {onSuccess});
			}
		})();
	};

	function showModal(initValue?: FormType) {
		reset({...initValue});
		modalRef.current?.show();
	}

	return (
		<>
			{component}
			<Modal title={modalTitle} size="xl" ref={modalRef}>
				<Form
					onSubmit={submit}
					className="flex flex-col gap-4"
					context={{disabled: isPreview, hideButton: isPreview}}>
					<ModalChild control={control} />
				</Form>
			</Modal>
		</>
	);
}

function ModalChild({control}: FormProps<FormType>) {
	const {type} = useWatch({control});
	const {isDelete} = modalTypeParser(type);

	if (isDelete) return <Button type="submit">Ya</Button>;

	return (
		<>
			<Input control={control} fieldName="name" />
			<div className="flex w-1/4 self-center justify-center">
				<ColorPicker control={control} fieldName="color" />
			</div>
			<Button type="submit">Submit</Button>
		</>
	);
}

function CColorPicker<F extends FieldValues>({
	controller,
	disabled,
}: ControlledComponentProps<F, {disabled?: boolean}>) {
	const formContext = useContext(FormContext);
	const {
		field: {value, onChange},
	} = controller;

	const color = value ?? '#FFFFFF';
	const isDisabled = formContext?.disabled || disabled;

	if (isDisabled) {
		return (
			<div
				className="w-10 h-10 rounded-full"
				style={{backgroundColor: color}}
			/>
		);
	}

	return (
		<Sketch
			color={color}
			className="!w-full !h-full"
			onChange={({hexa}) => onChange(hexa)}
		/>
	);
}

const ColorPicker = withReactFormController(CColorPicker);

function useQuery(form: TableFormValue) {
	return trpc.basic.getPage.useQuery<any, PagingResult<TKategoriMesin>>({
		...form,
		target,
	});
}
