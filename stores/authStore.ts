// stores/authStore.ts
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('AuthStore', () => {
	const user = ref<string | null>(null);
	const loaded = ref(false); // flag adicional

	const isLoggedIn = computed(() => user.value !== null);

	const login = (username: string, password: string) => {
		if (username === 'admin' && password === 'password123') {
			user.value = username;
			return true;
		}
		return false;
	};

	const logout = () => {
		user.value = null;
	};

	return {
		user,
		isLoggedIn,
		login,
		logout,
		loaded,
	};
}, {
	persist: {
		afterRestore: (context:any) => {
			context.store.loaded = true;
		}
	} as any  // <-- Añade este cast explícito
});
