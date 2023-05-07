import {PropsWithChildren} from "react";

import {ButtonProps} from "@mui/material";

export type TouchableProps = {
	className?: string;
	type?: "submit" | "button";
	onClick?: ButtonProps["onClick"];
};

export function Touchable(props: PropsWithChildren<TouchableProps>) {
	const {type = "button", ...rest} = props;
	return <button type={type} {...rest} />;
}
