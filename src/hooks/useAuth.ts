export const useAuth = () => {
	return {
		isLoggedIn: true,
		isFetching: false,
	} as const;
};
