import {ReactNode} from 'react';

import {Label} from 'flowbite-react';

type TextProps = {
	children?: ReactNode;
	className?: string;
};

export function Text({children, className}: TextProps) {
	return <Label className={className}>{children}</Label>;
}
