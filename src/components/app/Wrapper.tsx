import {Text} from "@components";
import {gap} from "@constants";
import {classNames} from "@utils";

type Props = {sizes?: [title?: string, description?: string]} & Partial<
	Record<"title" | "children" | "gap", string | null>
>;

export function Wrapper({
	gap: gapSpacing = gap,
	title,
	children,
	sizes,
}: Props) {
	const [sizeTitle, sizeDesc] = sizes ?? ["w-1/4", "flex-1"];

	return (
		<div className={classNames("flex", gapSpacing)}>
			<Text className={classNames("bg-white p-2", sizeTitle)}>{title}</Text>
			<Text className={classNames("bg-white p-2 px-4")}>:</Text>
			<Text className={classNames("bg-white p-2", sizeDesc)}>{children}</Text>
		</div>
	);
}
