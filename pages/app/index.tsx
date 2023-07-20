import {useRouter} from "next/router";

import {Button, Text} from "@components";
import {getLayout} from "@hoc";
import {classNames} from "@utils";
import {trpc} from "@utils/trpc";

App.getLayout = getLayout;

export default function App() {
	const {data} = trpc.dashboard.useQuery();
	const {push} = useRouter();

	return (
		<div className="-m-1 flex flex-wrap md:-m-2">
			{data?.map(({path, className: color, image, title, count = 0}, i) => {
				function navigate() {
					push(path!);
				}
				return (
					<div key={i} className="flex w-1/4 flex-wrap p-1 rounded-md">
						<div
							className={classNames(
								"flex flex-col flex-1 justify-between",
								"h-[150px]",
								"bg-cyan-600",
								"bg-green-600",
								color,
							)}>
							<div className="flex p-4 justify-between items-center">
								<div className="flex flex-col flex-1">
									<Text className="!text-white font-bold text-4xl">
										{count}
									</Text>
									<Text className="!text-white text-lg">{title}</Text>
								</div>
								<div className="w-[75px] opacity-50">
									<img alt="" src={image} />
								</div>
							</div>
							{path && (
								<div className="flex bg-black bg-opacity-10">
									<Button
										icon="faCircleArrowRight"
										className="flex-1 !text-white flex-row-reverse"
										variant="text"
										onClick={navigate}>
										More Info
									</Button>
								</div>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}
