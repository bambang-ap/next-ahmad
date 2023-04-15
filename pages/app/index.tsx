import {getLayout} from '@hoc';

export default function App() {
	return (
		<div className="-m-1 flex flex-wrap md:-m-2">
			{Array.from({length: 30}).map((_, i) => (
				<div key={i} className="flex w-1/3 flex-wrap p-1 rounded-md">
					<div className="h-44 flex-1 bg-red-500" />
				</div>
			))}
		</div>
	);
}

App.getLayout = getLayout;
