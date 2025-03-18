export default defineNuxtRouteMiddleware((to, from) => {
	if (process.client) {
		const authStore = useAuthStore();

		if (authStore.loaded) {
			if (authStore.user === null && to.path !== '/login') {
				return navigateTo('/login');
			}
		}
	}
});
