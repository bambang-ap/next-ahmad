import {useEffect, useState} from 'react';

export function useTicker(enabled: boolean, max?: number) {
	const [tick, setTick] = useState(0);

	useEffect(() => {
		let interval: NodeJS.Timer;
		if (enabled) {
			interval = setInterval(() => {
				setTick(prev => {
					if (!!max && prev === max) return 0;
					return prev + 1;
				});
			}, 1000);
		}

		return () => {
			clearInterval(interval);
			setTick(0);
		};
	}, [enabled]);

	return tick;
}
