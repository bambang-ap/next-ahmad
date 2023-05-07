import {ReactNode, useContext} from "react";

import {
	Button as MUIButton,
	ButtonProps as MUIButtonProps,
} from "@mui/material";

import {FormContext, Icon, IconProps, TouchableProps} from "@components";
import {classNames} from "@utils";
export type ButtonProps = TouchableProps &
	Pick<MUIButtonProps, "color" | "variant"> & {
		component?: string;
		icon?: IconProps["name"];
		iconClassName?: string;
		children?: ReactNode;
		disabled?: boolean;
	};

export function Button(props: ButtonProps) {
	const formContext = useContext(FormContext);
	const {
		className,
		iconClassName,
		children,
		icon,
		color = "inherit",
		variant = "contained",
		...rest
	} = props;

	if (formContext?.hideButton) return null;
	return (
		<MUIButton
			color={color}
			variant={variant}
			sx={{textTransform: "none"}}
			className={classNames("min-h-[36px] flex gap-2", className)}
			{...rest}>
			{icon && <Icon className={iconClassName} name={icon} />}
			{children}
		</MUIButton>
	);
}
