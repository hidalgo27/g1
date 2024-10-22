import VCalendar from 'v-calendar'
import 'v-calendar/style.css';

export default defineNuxtPlugin((nuxtApp) => {
	// @ts-ignore
	nuxtApp.vueApp.use(VCalendar)
})
