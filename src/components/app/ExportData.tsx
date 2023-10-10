import {useEffect, useState} from 'react';

import {Button} from '@components';
import {UseTRPCQueryResult} from '@trpc/react-query/shared';
import {exportData} from '@utils';

type Props<
	Q extends any[],
	C extends UseTRPCQueryResult<Q, unknown> = UseTRPCQueryResult<Q, unknown>,
> = {
	useQuery: () => C;
	dataMapper: (data: C['data']) => any[];
	names?: Parameters<typeof exportData>[1];
};

function GetData<Q extends any[]>({names, useQuery, dataMapper}: Props<Q>) {
	const {data} = useQuery();

	function dataExporter() {
		const result = dataMapper(data);
		exportData(result, names);
	}

	useEffect(dataExporter, []);

	return null;
}

export default function ExportData<Q extends any[]>(props: Props<Q>) {
	const key = uuid();
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		if (isReady) setTimeout(() => setIsReady(false), 1000);
	}, [isReady]);

	return (
		<>
			{isReady && <GetData key={key} {...props} />}
			<Button onClick={() => setIsReady(true)}>Export</Button>
		</>
	);
}
