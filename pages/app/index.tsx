import {getLayout} from '@hoc';

export default function App() {
	return (
		<div className="-m-1 flex flex-wrap md:-m-2">
			{Array.from({length: 30}).map(() => (
				<div className="flex w-1/3 flex-wrap p-1">
					<div className="h-44 flex-1 bg-red-500" />
				</div>
			))}
		</div>
	);
}

App.getLayout = getLayout;
