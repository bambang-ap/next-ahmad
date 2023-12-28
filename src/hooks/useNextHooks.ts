import {useRouter as useNextRouter} from 'next/router';

import {PATHS} from '@enum';

type Ret = Omit<ReturnType<typeof useNextRouter>, 'push'> & {
	push: (path: PATHS) => Promise<boolean>;
};

export function useRouter(): Ret {
	const {push, ...router} = useNextRouter();

	return {...router, push: path => push(path)};
}
