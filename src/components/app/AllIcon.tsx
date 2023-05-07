import * as svgIcon from "@fortawesome/free-solid-svg-icons";

import {Icon, IconProps} from "@components";

const icons = Object.keys(svgIcon);

export const AllIcon = ({
	selected,
	onSelect,
}: {
	selected: IconProps["name"];
	onSelect: (icon: IconProps["name"]) => void;
}) => {
	return (
		<>
			{icons.map(icon => (
				<Icon
					className={`mr-1 p-1 rounded ${
						selected === icon ? "border border-app-positive-03" : ""
					}`}
					key={icon}
					name={icon}
					onClick={() => onSelect?.(icon)}
				/>
			))}
		</>
	);
};
