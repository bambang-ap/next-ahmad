import {DeepPartial, FlowbiteTheme} from 'flowbite-react';

export const themeClassName: DeepPartial<FlowbiteTheme> = {
	sidebar: {
		collapsed: {off: '', on: ''},
		item: {
			content: {base: 'px-3 flex-1'},
			collapsed: {insideCollapse: 'group w-full transition duration-75'},
		},
		collapse: {list: 'ml-6'},
	},
	table: {
		cell: {base: 'px-3 py-2'},
		head: {
			cell: {
				base: 'px-3 py-4',
			},
		},
	},
	button: {
		color: {},
	},
};
