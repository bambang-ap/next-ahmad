import {createContext, PropsWithChildren, useEffect, useState} from 'react';

import {ThemeProvider} from '@mui/material';
import {StylesProvider} from '@mui/styles';

import {themeCreator} from './base';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ThemeContext = createContext((_themeName: string): void => {});

const ThemeProviderWrapper = (props: PropsWithChildren) => {
	const [themeName, _setThemeName] = useState('PureLightTheme');

	useEffect(() => {
		const curThemeName =
			window.localStorage.getItem('appTheme') || 'PureLightTheme';
		_setThemeName(curThemeName);
	}, []);

	const theme = themeCreator(themeName);
	const setThemeName = (nameTheme: string): void => {
		window.localStorage.setItem('appTheme', nameTheme);
		_setThemeName(nameTheme);
	};

	return (
		<StylesProvider injectFirst>
			<ThemeContext.Provider value={setThemeName}>
				<ThemeProvider theme={theme}>{props.children}</ThemeProvider>
			</ThemeContext.Provider>
		</StylesProvider>
	);
};

export default ThemeProviderWrapper;
