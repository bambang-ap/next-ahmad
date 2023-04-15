import React from 'react';

import {SidebarLayout} from '@layouts';

export const getLayout = (page: React.ReactElement) => {
	return <SidebarLayout>{page}</SidebarLayout>;
};
