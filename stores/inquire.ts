// stores/inquireStore.ts
import { defineStore } from 'pinia';
import moment from "moment";

export const useInquireStore = defineStore('InquireStore', () => {
	const config = useRuntimeConfig()
	const inquires = ref([]);
	const pagination = ref({
		current_page: 1,
		per_page: 10,
		total: 0,
		last_page: 0,
	});
	const totals = ref([])
	const loading = ref(false);
	const error = ref(null);



	const buildQueryParams = (params) => {
		const query = new URLSearchParams();
		for (const key in params) {
			if (params[key]) {
				query.append(key, params[key]);
			}
		}
		return query.toString();
	};

	const getInquires = async (filters = {}, page = 1, perPage = 10) => {
		let headers = new Headers();
		headers.append('Content-Type', 'application/json');

		loading.value = true;
		error.value = null;

		const queryParams = buildQueryParams({ ...filters, page, per_page: perPage });


		return new Promise(async (resolve, reject) => {
			try {
				const res = await fetch(config.public.apiBase+`/inquires/filter?${queryParams}`, {
					method: 'GET',
					headers: headers,
				});
				const data = await res.json();
				if (data) {
					inquires.value = data.inquires.data; // Actualizar los datos
					pagination.value = {
						current_page: data.inquires.current_page,
						per_page: data.inquires.per_page,
						total: data.inquires.total,
						last_page: data.inquires.last_page,
					};
					totals.value = data.totals;
					resolve(data);
				} else {
					reject('No data found');
				}
			} catch (error) {
				error.value = 'Error fetching inquires: ' + error.message;
				reject(error);
			} finally {
				loading.value = false;
			}
		});
	};

	const updateInquire = async (inquire) => {
		const body = {
			precio_inicial: inquire.precio_inicial,
			precio_venta: inquire.precio_venta,
			sub_profit: inquire.sub_profit,
			profit: inquire.profit,
			estado: inquire.estado,
			sent: inquire.sent,
			vendedor: inquire.vendedor,
			// sale_date: moment(inquire.sale_date).format('YYYY-MM-DD'),
			sale_date: inquire.sale_date ? moment(inquire.sale_date).format('YYYY-MM-DD') : null,

		};

		try {
			const response = await fetch(config.public.apiBase+`/update/inquire/${inquire.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body)
			});

			// Verifica si la respuesta fue exitosa
			if (response.ok) {
				const data = await response.json();
				console.log('Actualización exitosa', data);
				return {
					success: true,
					updatedData: data.updated_data, // Datos devueltos desde el servidor
				};
			} else {
				const errorData = await response.json();  // Captura el error devuelto por el servidor
				console.error('Error en la actualización', errorData);
				return {
					success: false,
					error: errorData,
				};
			}
		} catch (error) {
			console.error('Error de red', error);
			return {
				success: false,
				error,
			};
		}
	};

	const sendInquire = async (item: any, toMail: any) => {
		// let headers = new Headers();
		// headers.append('Content-Type', 'application/json');

		let objSend = {
			"to_mail": toMail,
			"package":item.package,
			"category_d":item.hotel,
			"destino_d":item.destinos,
			"pasajeros_d":item.pasajeros,
			"duracion_d":item.duracion,
			"el_nombre":item.nombre,
			"el_email":item.email,
			"el_fecha":item.travel_date,
			"el_telefono":item.telefono,
			"el_textarea":item.comentario,
			"country":item.codigo_pais
		}

		// console.log(JSON.stringify(objSend));

		try {
			const res = await fetch(config.public.apiBase+"/send/inquire", {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(objSend)
			});

			if (!res.ok) {
				// Si el status de la respuesta no es 2xx, lanza un error
				throw new Error(`Error en la solicitud: ${res.statusText}`);
			}

			const data = await res.json();
			return data; // Si todo sale bien, retorna la data
		} catch (error) {
			// Maneja cualquier error que ocurra en la solicitud
			throw new Error(`Error enviando inquiry: ${error.message}`);
		}
	};

	return {
		inquires,
		pagination,
		loading,
		error,
		totals,
		sendInquire,
		getInquires,
		updateInquire
	};
}, {
	persist: piniaPluginPersistedstate.localStorage(),
});