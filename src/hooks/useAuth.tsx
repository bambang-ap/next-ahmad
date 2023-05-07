import {useEffect} from "react";

import {useSession as useSessionNext} from "next-auth/react";
import {useRouter} from "next/router";

import {TSession} from "@appTypes/app.type";

export const useAuth = () => {
	const {replace, pathname} = useRouter();
	const {status, data} = useSession();

	useEffect(() => {
		if (status === "unauthenticated") replace("/auth/signin");
		if (status === "authenticated" && !pathname.includes("/app"))
			replace("/app");
	}, [status, pathname, data]);
};

export const useSession = () => {
	const {status, data} = useSessionNext() ?? {};

	return {status, data: data as TSession} as const;
};
