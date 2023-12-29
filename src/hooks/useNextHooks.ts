import {useRouter as useNextRouter} from 'next/router';
import {UrlObject} from 'url';

import {PATHS} from '@enum';

type R = ReturnType<typeof useNextRouter>;
type Url = UrlObject & {pathname?: PATHS};
type Ret = Omit<R, 'push'> & {
	push: (path: PATHS | Url) => Promise<boolean>;
};

export function useRouter(): Ret {
	const {push, ...router} = useNextRouter();

	return {...router, push: path => push(path)};
}
