import {FC, ReactNode} from 'react';

import {Box} from '@mui/material';
import PropTypes from 'prop-types';

interface BaseLayoutProps {
	children?: ReactNode;
}

export const BaseLayout: FC<BaseLayoutProps> = ({children}) => {
	return (
		<Box
			sx={{
				display: 'flex',
				flex: 1,
				height: '100%',
			}}>
			{children}
		</Box>
	);
};

BaseLayout.propTypes = {
	children: PropTypes.node,
};
