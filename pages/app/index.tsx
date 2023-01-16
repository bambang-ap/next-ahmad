import React from 'react';

import {SideBar} from '@appComponent/SideBar';
import {getLayout} from '@hoc';
import {atom} from 'recoil';

export const d = atom({key: 'sdjf', default: 'abcd'});

export default function App() {
	return <>jsdhkdfl</>;
}

App.getLayout = getLayout;
