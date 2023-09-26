import {TdHTMLAttributes} from "react";

import {classNames} from "@utils";

type TdProps = TdHTMLAttributes<HTMLTableCellElement> & {
	top?: boolean;
	center?: boolean;
};

export function BorderTd({center, top, className, ...props}: TdProps) {
	return (
		<td
			{...props}
			className={classNames(
				"border-black border-2",
				"flex-1 px-2 py-1",
				"font-semibold",
				"pb-2",
				{["text-center"]: center, ["align-top"]: top},
				className,
			)}
		/>
	);
}
