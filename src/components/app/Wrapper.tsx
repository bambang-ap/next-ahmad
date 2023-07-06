import {Text} from "@components";
import {gap} from "@constants";
import {classNames} from "@utils";

export type WrapperProps = {
	sizes?: [title?: string, description?: string];
	noColon?: boolean;
} & Partial<Record<"title" | "children" | "gap", string | null>>;

export function Wrapper({
	gap: gapSpacing = gap,
	title,
	children,
	sizes,
	noColon,
}: WrapperProps) {
	const [sizeTitle, sizeDesc] = sizes ?? ["w-1/4", "flex-1"];

	return (
		<div className={classNames("flex", gapSpacing)}>
			<Text className={classNames("bg-white p-2", sizeTitle)}>{title}</Text>
			{!noColon && <Text className={classNames("bg-white p-2 px-4")}>:</Text>}
			<Text className={classNames("bg-white p-2", sizeDesc)}>{children}</Text>
		</div>
	);
}
