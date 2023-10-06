import {Text} from "@components";
import {gap} from "@constants";
import {classNames} from "@utils";

export type WrapperProps = {
	noColon?: boolean;
	transparent?: boolean;
	sizes?: [title?: string, description?: string];
	className?: string;
} & Partial<Record<"title" | "children" | "gap", string | null>>;

export function Wrapper({
	gap: gapSpacing = gap,
	title,
	children,
	sizes,
	className,
	noColon,
	transparent,
}: WrapperProps) {
	const [sizeTitle, sizeDesc] = sizes ?? ["w-1/4", "flex-1"];

	return (
		<div className={classNames("flex", gapSpacing)}>
			<Text
				className={classNames(
					"p-2",
					sizeTitle,
					{"bg-white": !transparent},
					className,
				)}
				color="black">
				{title}
			</Text>
			{!noColon && (
				<Text
					className={classNames(
						"p-2 px-4",
						{"bg-white": !transparent},
						className,
					)}>
					:
				</Text>
			)}
			<Text
				className={classNames(
					"p-2",
					sizeDesc,
					{"bg-white": !transparent},
					className,
				)}
				color="black">
				{children}
			</Text>
		</div>
	);
}
