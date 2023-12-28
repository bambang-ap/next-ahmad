import {FormEventHandler, useEffect} from 'react';

import {useForm} from 'react-hook-form';

import {ZId} from '@appTypes/app.type';
import {Button, Form, Input} from '@components';
import {isProd} from '@constants';
import {PATHS} from '@enum';
import {getLayout} from '@hoc';
import {useLoader, useRouter} from '@hooks';
import {trpc} from '@utils/trpc';

RemoveScan.getLayout = getLayout;

export default function RemoveScan() {
	const {replace} = useRouter();

	useEffect(() => {
		if (isProd) replace(PATHS.app);
	}, [isProd]);

	if (isProd) return null;

	return <RenderPage />;
}

function RenderPage() {
	const {component, mutateOpts} = useLoader();
	const {control, watch, clearErrors, handleSubmit} = useForm<ZId>();
	const {id} = watch();

	const {mutate} = trpc.scan.devOnly.remove.useMutation(mutateOpts);
	const {data, refetch, isFetching} = trpc.scan.devOnly.get.useQuery(
		{id},
		{enabled: !!id},
	);

	const founded = !!data;

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();

		if (!confirm('Are you sure?')) return;

		return handleSubmit(values =>
			mutate(values, {
				onSettled() {
					refetch();
				},
			}),
		)();
	};

	return (
		<>
			{component}
			<Form
				onSubmit={submit}
				className="flex flex-col gap-2"
				context={{hideButton: !id || isFetching || !founded}}>
				<Input
					fieldName="id"
					control={control}
					isLoading={isFetching}
					rightAcc={
						!isFetching && (
							<div
								className={classNames('w-1/4 text-end', {
									'text-green-500': founded,
									'text-red-500': !founded,
								})}>
								{founded ? 'Founded' : 'Not Found'}
							</div>
						)
					}
				/>

				<Button type="submit">Remove</Button>
			</Form>
		</>
	);
}
