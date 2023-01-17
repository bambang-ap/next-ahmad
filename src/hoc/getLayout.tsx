import React from 'react';

import AppLayout from '@appComponent/AppLayout';

export const getLayout = (page: React.ReactElement) => {
	return <AppLayout>{page}</AppLayout>;
};
