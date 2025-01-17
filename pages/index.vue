<script setup lang="ts">

// import {useStore} from "~/stores/test";

import moment from "moment-timezone";

const showModal = ref(false)

const loadingRows = ref([]);

import { useInquireStore } from '@/stores/inquire'

const inquireStore = useInquireStore();
const inquires = ref([]);
const totals = ref([]);
const loading = ref(false);
const error = ref(null);

const perPage = ref(10);

const range_sale_date = ref([]);
const range_travel_date = ref([]);
const range_created_date = ref([]);

const view_sale_columns = ref(false)

const file_hover = ref(false)

const loading_mail = ref({})

const view_sum = ref(false)

// Paginación
const pagination = ref([]);

// Definir los filtros
const defaultFilters = {
  producto: '',
  device: '',
  browser: '',
  origen: '',
  estado: '',
  start_sale_date: '',
  end_sale_date: '',
  start_travel_date: '',
  end_travel_date: '',
  created_start: '',
  created_end: '',
  vendedor: ''
};
const filters = ref({ ...defaultFilters });

const vendedores = ref([
  { id: 1, nombre: 'Saira', email: 'sai@gotoperu.com' },
  { id: 2, nombre: 'Fiorella', email: 'fiorella@gotoperu.com' },
  { id: 3, nombre: 'Karina', email: 'karina@gotoperu.com' },
  { id: 4, nombre: 'Pabel', email: 'pabel@gotoperu.com' },
  { id: 5, nombre: 'Angie', email: 'angie@gotoperu.com' },
  { id: 6, nombre: 'Paul', email: 'paul@gotoperu.com' },
  { id: 7, nombre: 'Afdel', email: 'afdel@gotolatam.com' },
  { id: 8, nombre: 'Josep', email: 'josep@gotolatam.com' },
  { id: 9, nombre: 'Yhon', email: 'yhon@gotolatam.com' }
]);

const brands = ref([
  {id:1, nombre:'gotoperu.com', color:'border-pink-500 bg-pink-500/10 text-pink-800'},
  {id:2, nombre:'gotolatam.com', color:'border-orange-500 bg-orange-500/10 text-orange-800'},
  {id:3, nombre:'machupicchu.company', color:'border-purple-500 bg-purple-500/10 text-purple-800'},
  // {id:4, nombre:'gotoperu.com.mx', color:'border-sky-500 bg-sky-500/10 text-sky-800'},
  {id:4, nombre:'gotoperu.tours', color:'border-teal-500 bg-teal-500/10 text-teal-800'},
  {id:5, nombre:'gotoperu.co', color:'border-sky-500 bg-sky-500/10 text-sky-800'},
  {id:6, nombre:'gotoecuador.com', color:'border-red-500 bg-red-500/10 text-red-800'},

]);

const itemsPerPage = ref([
  {id:5, page:'5'},
  {id:10, page:'10'},
  {id:20, page:'20'},
  {id:50, page:'50'},
  {id:100, page:'100'},
]);

// Estado para almacenar la fecha y hora en formato Perú
const currentDateTime = ref('');

// Captura fecha y hora en la zona horaria de Perú
const captureDateTime = () => {
  currentDateTime.value = moment().utcOffset('-05:00').format('YYYY-MM-DD HH:mm:ss'); // Formato personalizado
};

// Sincronizar los inquires con el store de Pinia
watch(() => ({
  inquires: inquireStore.inquires,
  totals: inquireStore.totals,
  pagination: inquireStore.pagination
}), (newValues) => {
  inquires.value = newValues.inquires;
  totals.value = newValues.totals;
  pagination.value = newValues.pagination
}, { immediate: true });

const getVendedorNombre = (vendedorId:any) => {
  // Verificar si vendedorId es nulo, indefinido o vacío
  if (!vendedorId) {
    return 'Sin Asignar'; // Si el vendedorId está vacío o es nulo, retornamos "Sin Asignar"
  }

  // Buscar el vendedor en la lista de vendedores
  const vendedor = vendedores.value.find(v => v.id === vendedorId);

  // Retornar el nombre si se encuentra el vendedor, de lo contrario "Sin Asignar"
  return vendedor ? vendedor.email : 'Sin Asignar';
};

const saveInquire = async (inquire:any, index:any, toMail:any) => {
  // Inicia el estado de carga para la fila actual
  loadingRows.value[index] = true;

  try {
    if (
        inquire.precio_venta &&
        inquire.vendedor &&
        inquire.sent &&
        inquire.estado < 3
    ) {
      // Si cumple las condiciones, cambia el estado a 2 (vendido) y actualiza sale_date
      inquire.estado = 2; // Cambia el estado a 2
      inquire.sale_date = inquire.sale_date || moment().format('YYYY-MM-DD'); // Establece la fecha actual si sale_date no tiene valor
    }

    // Si inquire.precio_venta tiene un valor, cambia el estado a 2 (vendido) y actualiza sale_date
    if (inquire.precio_venta) {
      inquire.estado = 2; // Cambia el estado a 2 si precio_venta tiene valor
      inquire.sale_date = inquire.sale_date || moment().format('YYYY-MM-DD'); // Establece la fecha actual si sale_date no tiene valor
    }

    // Verifica si inquire.vendedor está presente y si inquire.sent y inquire.estado están vacíos o no definidos
    if (inquire.vendedor && (!inquire.sent || inquire.sent === '') && (!inquire.estado || inquire.estado === '')) {
      // Actualiza inquire.estado e inquire.sent solo si es la primera vez que se está guardando
      inquire.estado = 1;
      inquire.sent = 1;

      // Llamar a la función del store para actualizar el inquire
      const success = await inquireStore.updateInquire(inquire);

      if (success) {
        console.log('Inquire guardado con éxito');
        // Como inquire.sent se acaba de establecer en 1, se envía el correo por única vez
        await sendMail(inquire, toMail);
      } else {
        console.error('Error al guardar el inquire');
      }
    } else if (inquire.estado === 1) {
      // Si el estado es 1, pero inquire.sent ya está establecido, no enviar correo de nuevo
      const success = await inquireStore.updateInquire(inquire);
      if (success) {
        console.log('Inquire actualizado, pero el correo ya fue enviado anteriormente');
      } else {
        console.error('Error al actualizar el inquire');
      }
    } else {
      // Si el estado es diferente de 1, no se envía el correo
      const success = await inquireStore.updateInquire(inquire);
      if (success) {
        console.log('Inquire actualizado sin enviar correo (estado no es 1)');
      } else {
        console.error('Error al actualizar el inquire');
      }
    }
  } catch (error) {
    console.error('Error durante la actualización', error);
  } finally {
    // Termina el estado de carga para la fila actual
    loadingRows.value[index] = false;
  }
};

const sendMail = async (item:any, toMail:any) => {
  loading_mail.value[item.id] = true;
  try {
    const response = await inquireStore.sendInquire(item, toMail);
  } catch (error) {
    alert('Error: ' + error.message);
  } finally {
    loading_mail.value[item.id] = false;
  }
}

const changePerPage = async () => {
  loading.value = true;
  await inquireStore.getInquires(filters.value, inquireStore.pagination.current_page, perPage.value);  // Reiniciar la paginación a la página 1
  loading.value = false;
};

const nextPage = async () => {

  if (pagination.value.current_page < pagination.value.last_page) {
    loading.value = true;
    pagination.value.current_page += 1;
    await inquireStore.getInquires(filters.value, pagination.value.current_page, inquireStore.pagination.per_page);
    loading.value = false;
  }
}

const prevPage = async () => {
  if (pagination.value.current_page > 1) {
    loading.value = true;
    pagination.value.current_page -= 1;
    await inquireStore.getInquires(filters.value, pagination.value.current_page, inquireStore.pagination.per_page);
    loading.value = false;
  }
};


// Aplicar los filtros
const applyFilters = async () => {
  view_sum.value = true;
  loading.value = true;
  await inquireStore.getInquires(filters.value, 1, inquireStore.pagination.per_page);  // Reiniciar a la página 1
  loading.value = false;
};

// Resetear los filtros al estado inicial
const resetFilters = async () => {
  view_sum.value = false;
  filters.value = { ...defaultFilters };  // Crear un nuevo objeto para garantizar que Vue detecte el cambio
  loading.value = true;
  filters.value.producto = "gotoperu.com"
  // console.log(filters.value)
  await inquireStore.getInquires(filters.value, 1, 20);  // Volver a cargar sin filtros
  loading.value = false;
};

const attrs = ref([
  {
    key: 'today',
    highlight: {
      color: 'green',
      fillMode: 'solid'
    },
    dates: new Date()
  }
])

const onDateChangeSaleDate = (newRange:any) => {
  filters.value.start_sale_date = moment(newRange.start).format('YYYY-MM-DD');
  filters.value.end_sale_date = moment(newRange.end).format('YYYY-MM-DD');
};
const onDateChangeTravelDate = (newRange:any) => {
  filters.value.start_travel_date = moment(newRange.start).format('YYYY-MM-DD');
  filters.value.end_travel_date = moment(newRange.end).format('YYYY-MM-DD');
};
const onDateChangeCreatedDate = (newRange:any) => {
  filters.value.created_start = moment(newRange.start).format('YYYY-MM-DD');
  filters.value.created_end = moment(newRange.end).format('YYYY-MM-DD');
};

const getBrand = (brand:any) => {
  filters.value.producto = brand
  applyFilters()
};

const file_hover_bg = (val:any) => {
  file_hover.value = val;
}



// Cargar la primera página cuando el componente se monta
onMounted(async () => {
  // console.log("Now: ", moment().format('YYYY-MM-DD HH:mm:ss'));
  loading.value = true;
  filters.value.producto = "gotoperu.com"

  if (pagination.value.per_page) {
    perPage.value = pagination.value.per_page
  }

  try {
    // Cargar la página guardada en localStorage
    await inquireStore.getInquires(filters.value, inquireStore.pagination.current_page, inquireStore.pagination.per_page);
    loadingRows.value = Array(inquireStore.inquires.length).fill(false);

  } catch (err) {
    error.value = err;
  } finally {
    loading.value = false;
  }
});

</script>

<template>

  <div class="flex flex-col min-h-screen ">
    <!-- Header Full Width -->
    <header class="flex shadow-lg bg-white relative z-10  text-white p-4">
      <div class="">
        <div class="flex py-4 first:pt-0 last:pb-0">
          <img class="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
          <div class="ml-3 overflow-hidden">
            <p class=" font-semibold text-slate-900">Jorge Enrrique</p>
            <p class="text-xs text-slate-500 truncate">Ventas</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Section with Aside and Main Content -->
    <section class="flex flex-1">

      <!-- Aside on the Left -->
      <aside class="w-[15%] bg-white 2xl:w-[10%]  py-4 shadow-lg">
        <div class="pl-4 my-6 mb-8">
          <h4 class="font-semibold text-xl mb-2">Bienvenido!</h4>
          <p class="text-sm">Qué vamos hacer hoy?</p>
        </div>
        <nav>
          <ul class="pr-12">
            <li class="mb-4">
              <a href="#" class="text-white  bg-lime-600 rounded-r-2xl  block px-4 py-3">Inicio</a>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Main Content on the Right -->
      <div class="flex-1 w-[75%] p-6">
        <h2 class="text-2xl font-bold mb-4">Inquires</h2>

<!--        <p>Fecha y hora actuales (Perú): {{ currentDateTime }}</p>-->

        <!-- Mostrar un mensaje de carga si los datos están siendo obtenidos -->
        <div v-if="loading">Cargando...</div>

        <!-- Mostrar un mensaje de error si ocurre algún problema -->
        <div v-if="error">{{ error }}</div>

        <div class="grid grid-cols-12 gap-6 mb-6" v-show="view_sum">
          <div class="col-span-4 bg-sky-100 text-sky-600  rounded-lg p-6 text-center">
            <p class="text-3xl font-semibold">${{ totals.total_sub_profit }}</p>
            <p class="text-sky-700 font-semibold">Potencial profit</p>
          </div>
          <div class="col-span-4 bg-pink-100 text-pink-600  rounded-lg p-6 text-center">
            <p class="text-3xl font-semibold">${{ totals.total_profit }}</p>
            <p class="text-pink-700 font-semibold">Total profit</p>
          </div>
          <div class="col-span-4 bg-fuchsia-50 text-fuchsia-600  rounded-lg p-6 text-center">
            <p class="text-3xl font-semibold">${{ totals.total_precio_venta }}</p>
            <p class="text-fuchsia-700 font-semibold">Sale price</p>
          </div>
        </div>
        <!-- Filtros para el usuario -->
        <div class=" bg-white border shadow-lg shadow-gray-500/10 border-gray-200 rounded-lg p-6 mb-6 grid grid-cols-12 gap-6">

          <div class="relative col-span-2">
            <VDatePicker v-model.range="range_created_date" mode="date" @update:modelValue="onDateChangeCreatedDate">
              <template #default="{ togglePopover }">
                <button
                    class="select-goto relative text-left"
                    @click="togglePopover"
                >

                  <span v-if="filters.created_start && filters.created_end">{{ filters.created_start+' to '+filters.created_end }}</span>
                  <span v-else>Choose range date</span>
                  <span class="input-goto-label -top-3 !text-xs" >Inquire Date</span>

                </button>

              </template>
            </VDatePicker>
          </div>

          <div class="relative col-span-2">
            <VDatePicker v-model.range="range_travel_date" mode="date" @update:modelValue="onDateChangeTravelDate">
              <template #default="{ togglePopover }">
                <button
                    class="select-goto relative text-left"
                    @click="togglePopover"
                >

                  <span v-if="filters.start_travel_date && filters.end_travel_date">{{ filters.start_travel_date+' to '+filters.end_travel_date }}</span>
                  <span v-else>Choose range date</span>
                  <span class="input-goto-label -top-3 !text-xs" >Travel Date</span>

                </button>

              </template>
            </VDatePicker>
          </div>


          <div class="relative col-span-2">
            <VDatePicker v-model.range="range_sale_date" mode="date" @update:modelValue="onDateChangeSaleDate">
              <template #default="{ togglePopover }">
                <button
                    class="select-goto relative text-left"
                    @click="togglePopover"
                >

                  <span v-if="filters.start_sale_date && filters.end_sale_date">{{ filters.start_sale_date+' to '+filters.end_sale_date }}</span>
                  <span v-else>Choose range date</span>
                  <span class="input-goto-label -top-3 !text-xs" >Sale Date</span>

                </button>

              </template>
            </VDatePicker>
          </div>

          <div class="relative col-span-2 hidden">
            <select class="select-goto peer" id="product_id" v-model="filters.producto">
              <option value="" disabled selected >Choose a product</option>
              <option v-for="brand in brands">{{ brand.nombre }}</option>
<!--              <option>gotoperu.com.mx</option>-->
<!--              <option>gotoperu.tours</option>-->
<!--              <option>machupicchu.company</option>-->
              <!-- Más opciones -->
            </select>
            <label class="input-goto-label" for="product_id">Product</label>
          </div>

          <div class="relative col-span-2">
            <select class="select-goto peer" id="device_id" v-model="filters.device">
              <option value="" disabled selected hidden>Choose a device</option>
              <option>móvil</option>
              <option>desktop</option>
            </select>
            <label class="input-goto-label" for="device_id">Device</label>
          </div>

          <div class="relative col-span-2">
            <select class="select-goto peer" id="browser_id" v-model="filters.browser">
              <option value="" disabled selected hidden>Choose a browser</option>
              <option>Chrome</option>
              <option>Safari</option>
              <option>Firefox</option>
            </select>
            <label class="input-goto-label" for="browser_id">Browser</label>
          </div>

          <div class="relative col-span-2">
            <select class="select-goto peer" id="origen_id" v-model="filters.origen">
              <option value="" disabled selected hidden>Choose a origin</option>
              <option>Whatsapp</option>
              <option>Phone</option>
              <option>Mail</option>
              <option>Other</option>
            </select>
            <label class="input-goto-label" for="origen_id">Origin</label>
          </div>

          <div class="relative col-span-2">
            <select class="select-goto peer" id="estado_id" v-model="filters.estado">
              <option value="" disabled selected hidden>Choose a status</option>
              <option value="1">Assigned</option>
              <option value="2">Selling</option>
              <option value="3">Archive</option>
            </select>
            <label class="input-goto-label" for="estado_id">Status</label>
          </div>

          <div class="relative col-span-2">
            <select class="select-goto peer" id="vendedor_id" v-model="filters.vendedor">
              <option value="" disabled selected hidden>Choose a seller</option>
              <option v-for="vendedor in vendedores" :key="vendedor.id" :value="vendedor.id">
                {{ vendedor.nombre }}
              </option>

            </select>
            <label class="input-goto-label" for="vendedor_id">Seller</label>
          </div>


<!--          <div class="relative col-span-2">-->
<!--            <input class="input-goto peer" type="date" v-model="filters.start_sale_date" id="sale_date_start" placeholder="Fecha de Venta Inicio" />-->
<!--            <label class="input-goto-label" for="sale_date_start">Fecha de Venta Inicio</label>-->
<!--          </div>-->
<!--          <div class="relative col-span-2">-->
<!--            <input class="input-goto peer" type="date" v-model="filters.end_sale_date" id="sale_date_end" placeholder="Fecha de Venta Fin" />-->
<!--            <label class="input-goto-label" for="sale_date_end">Fecha de Venta Fin</label>-->
<!--          </div>-->
<!--          <div class="relative col-span-2">-->
<!--            <input class="input-goto peer" type="date" v-model="filters.start_travel_date" id="travel_date_start" placeholder="Fecha de Viaje Inicio" />-->
<!--            <label class="input-goto-label" for="travel_date_start">Fecha de Viaje Inicio</label>-->
<!--          </div>-->
<!--          <div class="relative col-span-2">-->
<!--            <input class="input-goto peer" type="date" v-model="filters.end_travel_date" id="travel_date_end" placeholder="Fecha de Viaje Fin" />-->
<!--            <label class="input-goto-label" for="travel_date_end">Fecha de Viaje Fin</label>-->
<!--          </div>-->
<!--          <div class="relative col-span-2">-->
<!--            <input class="input-goto peer" type="date" v-model="filters.created_start" id="created_date_start" placeholder="Fecha Creación Inicio" />-->
<!--            <label class="input-goto-label" for="created_date_start">Fecha Creación Inicio</label>-->
<!--          </div>-->
<!--          <div class="relative col-span-2">-->
<!--            <input class="input-goto peer" type="date" v-model="filters.created_end" id="created_date_end" placeholder="Fecha Creación Fin" />-->
<!--            <label class="input-goto-label" for="created_date_end">Fecha Creación Fin</label>-->
<!--          </div>-->

          <div class="relative col-span-4 flex gap-2">
            <button @click="applyFilters" class="btn-primary-sm text-sm">Aplicar Filtros</button>
            <button @click="resetFilters" class="btn-ternary-outline-sm text-sm">Resetear Filtros</button> <!-- Botón para resetear los filtros -->
          </div>

        </div>


        <div class="flex justify-between items-center">
          <div class="flex gap-3">
            <button type="button" @click="getBrand(brand.nombre)" class="nav-brand transition duration-300" :class="[filters.producto === brand.nombre ? brand.color+' active' : '']" v-for="brand in brands">{{ brand.nombre }}</button>
          </div>
          <div class="text-right text-sm text-gray-700 italic cursor-pointer" @click="view_sale_columns = !view_sale_columns">
            View price columns
          </div>
        </div>

        <div class="border border-gray-200 shadow-lg shadow-gray-500/10 bg-white rounded-lg rounded-tl-none overflow-x-auto py-6 px-2">

          <div class="inline-block min-w-full  rounded-lg overflow-hidden">

            <table class="min-w-full leading-normal" v-if="inquires.length > 0">
              <thead>
              <tr>

                <th class="px-3 py-3 border-b border-gray-200 bg-gray-0 text-left text-xs font-semibold text-gray-600 uppercase truncate tracking-tighter">Inquire Date</th>
                <th
                    class="px-3 py-3 border-b border-gray-200 bg-gray-0 text-left text-xs font-semibold text-gray-600 uppercase truncate tracking-tighter">
                  Travel Date
                </th>
                <th
                    class="px-3 py-3 border-b border-gray-200 bg-gray-0 text-left text-xs font-semibold text-gray-600 uppercase truncate tracking-tighter">
                  Product
                </th>
                <th
                    class="px-3 py-3 border-b border-gray-200 bg-gray-0 text-left text-xs font-semibold text-gray-600 uppercase truncate tracking-tighter">
                  Inquire
                </th>

                <th
                    class="px-3 py-3 border-b border-gray-200 bg-gray-0 text-left text-xs font-semibold text-gray-600 uppercase  tracking-tighter">
                  Seller
                </th>


                <th class="px-3 py-3 border-b border-gray-200 bg-gray-0 text-left text-xs font-semibold text-gray-600 uppercase truncate w-20 tracking-tighter">
                  Potencial profit
                </th>

                <th class="px-3 py-3 border-b border-gray-200 bg-gray-0 text-left text-xs font-semibold text-gray-600 uppercase truncate w-20 tracking-tighter" v-show="view_sale_columns">
                  Sale price
                </th>

                <th class="px-3 py-3 border-b border-gray-200 bg-gray-0 text-left text-xs font-semibold text-gray-600 uppercase truncate w-20 tracking-tighter" v-show="view_sale_columns">
                  Total profit
                </th>
                <th class="px-3 py-3 border-b border-gray-200 bg-gray-0 text-left text-xs font-semibold text-gray-600 uppercase truncate tracking-tighter" v-show="view_sale_columns">
                  Sale date
                </th>

                <th
                    class="px-3 py-3 border-b border-gray-200 bg-gray-0 text-left text-xs font-semibold text-gray-600 uppercase truncate tracking-tighter text-right">
                  Status
                </th>

                <th
                    class="px-3 py-3 border-b border-gray-200 bg-gray-0 text-left text-xs font-semibold text-gray-600 uppercase truncate tracking-tighter">
                </th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(inquire, index) in inquires" :key="index" class="group relative hover:bg-violet-50" >

                <td class="px-3 py-3 border-b border-gray-200 w-16">
                  <p class="text-gray-400 italic whitespace-no-wrap text-xs">
                    <span v-if="inquire.inquire_date">{{ moment(inquire.inquire_date).format('DD-MMM-YYYY HH:mm:ss') }}</span>
                    <span v-else>{{ moment(inquire.created_at).format('YYYY-MM-DD') }}</span>
<!--                    <span v-if="inquire.inquire_date">{{ inquire.inquire_date }}</span>-->
                  </p>
                </td>
                <td class="px-3 py-3 border-b border-gray-200 w-20 2xl:w-28 text-xs">
                  <p class="text-gray-900 whitespace-no-wrap text-xs">
                    {{ moment(inquire.travel_date).format('YYYY-MM-DD') }}
                  </p>
                </td>

                <td class="px-3 py-3 border-b border-gray-200  w-20 text-xs">
                  <p class="text-gray-900 whitespace-no-wrap ">{{ inquire.producto }}</p>
                </td>
                <td class="px-3 py-3 border-b border-gray-200  text-xs w-40 2xl:w-[50rem]">
                  <VDropdown
                      :distance="6"
                  >
                    <!-- This will be the popover reference (for the events and position) -->
                    <button class="truncate text-left text-gray-400 w-40 2xl:w-[50rem] capitalize">{{ inquire.email }} | {{ inquire.nombre }} | {{ inquire.codigo_pais }} {{ inquire.telefono }} | {{inquire.package}} | {{ inquire.hotel }} | {{ inquire.device }} | {{ inquire.pasajeros }} person | {{ inquire.duracion }} days | travel date  {{ inquire.travel_date }} | {{ inquire.comentario }}</button>

                    <!-- This will be the content of the popover -->
                    <template #popper>
                      <div class="p-6 grid grid-cols-2 w-[42rem] gap-2 text-sm">
                        <div class="">
                          <b>Package:</b> {{ inquire.package }}
                        </div>
                        <div class="">
                          <b>Hotel category:</b> {{ inquire.hotel }}
                        </div>
                        <div class="">
                          <b>Number of travelers
                            :</b> {{ inquire.pasajeros }}
                        </div>
                        <div class="">
                          <b>Trip length :</b> {{ inquire.duracion }}
                        </div>
                        <div class="">
                          <b>Travel Date :</b> {{ moment(inquire.travel_date).format('DD MMM YYYY') }}
                        </div>
                        <div class="">
                          <b>Full name :</b> {{ inquire.nombre }}
                        </div>
                        <div class="">
                          <b>Email :</b> {{ inquire.email }}
                        </div>
                        <div class="">
                          <b>Phone Number :</b> {{ inquire.codigo_pais }} {{ inquire.telefono }}
                        </div>
                        <div class="">
                          <b>Device :</b> {{ inquire.device }} / {{ inquire.browser }}
                        </div>
                        <div class="col-span-2">
                          <b>Message:</b> {{ inquire.comentario }}
                        </div>

                      </div>
                    </template>
                  </VDropdown>

                </td>
<!--                <td class="px-3 py-3 border-b border-gray-200  text-xs">-->
<!--                  <input type="text" class="text-right p-1 border w-16 2xl:w-28 rounded border-gray-400" v-model="inquire.precio_inicial" :disabled="loadingRows[index]">-->
<!--                </td>-->


                <td class="px-3 py-3 border-b border-gray-200   text-xs w-20 2xl:w-28">
                  <select class="p-1 border rounded border-gray-400 w-20 2xl:w-28" v-model="inquire.vendedor" :disabled="loadingRows[index]">
                    <option v-for="vendedor in vendedores" :key="vendedor.id" :value="vendedor.id">
                      {{ vendedor.nombre }}
                    </option>
                  </select>
                </td>




                <td class="px-3 py-3 border-b border-gray-200  text-xs">
                  <input type="text" class="text-right p-1 border w-16 2xl:w-28 rounded border-gray-400" v-model="inquire.sub_profit" :disabled="loadingRows[index]">
                </td>

                <td class="px-3 py-3 border-b border-gray-200 bg-purple-50  text-xs" v-show="view_sale_columns">
                  <input type="text" class="text-right p-1 border w-16 2xl:w-28 rounded border-gray-400" v-model="inquire.precio_venta" :disabled="loadingRows[index]">
                </td>
                <td class="px-3 py-3 border-b border-gray-200 bg-purple-50  text-xs" v-show="view_sale_columns">
                  <input type="text" class="text-right p-1 border w-16 2xl:w-28 rounded border-gray-400" v-model="inquire.profit" :disabled="loadingRows[index]">
                </td>

                <td class="px-3 py-3 border-b border-gray-200 bg-purple-50 w-16 2xl:w-28 text-xs" v-show="view_sale_columns">
                  <client-only>
                    <VDatePicker v-model="inquire.sale_date" :attributes="attrs">
                      <template #default="{ togglePopover }">
                        <button
                            class="flex w-24 items-end gap-1"
                            @click="togglePopover"
                        >
                          <span>{{ moment(inquire.sale_date).format('YYYY-MM-DD') }}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 text-purple-500">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                          </svg>

                        </button>
                      </template>
                    </VDatePicker>
                  </client-only>
                </td>

                <td class="px-3 py-3 border-b border-gray-200  text-xs text-right">
<!--                  <select class="p-1 border rounded border-gray-400 w-20 2xl:w-28" v-model="inquire.estado" :disabled="loadingRows[index]">-->
<!--                    <option :value="1">Assigned</option>-->
<!--                    <option :value="2">Selling</option>-->
<!--                    <option :value="3">New</option>-->
<!--                  </select>-->
                  <span
                      :class="{
                      'bg-green-100 text-green-800': inquire.estado == 1,  // Assigned
                      'bg-blue-100 text-blue-800': inquire.estado == 2,    // Selling
                      'bg-gray-100 text-gray-800': inquire.estado == 3     // New
                    }"
                                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                                  >
                    {{ inquire.estado == 1 ? 'Assigned' : inquire.estado == 2 ? 'Selling' : 'New' }}
                  </span>
                </td>

<!--                :class="[file_hover == inquire.id ? 'bg-gray-100' : '']"-->
                <td class="px-3 py-3 border-b border-gray-200 text-xs w-20 2xl:w-32" >
                  <div class="flex gap-2 items-center justify-end">
                  <div class="">
                    <VTooltip>
                      <button @click="saveInquire(inquire, index, getVendedorNombre(inquire.vendedor))" :disabled="loadingRows[index]" v-if="!loadingRows[index]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-blue-500">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                        </svg>
                      </button>

                      <template #popper>
                        Save
                      </template>
                    </VTooltip>

                    <span v-if="loadingRows[index]">
                      <svg class="animate-spin h-5 w-5 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  </div>

                  <div class="">
                    <VTooltip>
                      <button>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-gray-500">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                        </svg>
                      </button>

                      <template #popper>
                        Archivar
                      </template>
                    </VTooltip>


                  </div>
                    <div class="" v-show="inquire.sent > 0">

                      <VDropdown
                          :distance="6"
                      >
                        <!-- This will be the popover reference (for the events and position) -->
                        <button @click="file_hover_bg(inquire.id)" v-show="!loading_mail[inquire.id]">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-gray-500">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                          </svg>
                        </button>

                        <!-- This will be the content of the popover -->
                        <template #popper>
                          <div class="p-3 flex items-center gap-1">
                            <p>reenviar a : <span class="text-indigo-500">{{getVendedorNombre(inquire.vendedor)}}</span></p>
                            <button @click="sendMail(inquire, getVendedorNombre(inquire.vendedor))" v-close-popper>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-green-500 ">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                              </svg>
                            </button>
                          </div>
                        </template>
                      </VDropdown>

                      <span v-show="loading_mail[inquire.id]">
                      <svg class="animate-spin h-5 w-5 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>

                    </div>
                  </div>
                </td>

              </tr>

              <tr>
                <td></td>
                <td></td>
<!--                <td class="px-3 py-3 border-b border-gray-200  bg-white text-xs text-purple-500 text-right font-semibold">${{ totals.total_precio_inicial }}</td>-->

<!--                <td class="px-3 py-3 border-b border-gray-200  bg-white text-xs text-purple-500 text-right font-semibold">${{ totals.total_sub_profit }}</td>-->
<!--                <td class="px-3 py-3 border-b border-gray-200  bg-white text-xs text-purple-500 text-right font-semibold">${{ totals.total_profit }}</td>-->
<!--                <td class="px-3 py-3 border-b border-gray-200  bg-white text-xs text-purple-500 text-right font-semibold">${{ totals.total_precio_venta }}</td>-->
              </tr>


              </tbody>
            </table>
            <div class="text-center my-2 text-sm">
              <label for="perPage">Items per page:</label>
              <select id="perPage" v-model="perPage" @change="changePerPage">
                <option :value="items.page" v-for="items in itemsPerPage">{{items.page}}</option>
              </select>
            </div>
            <div class="px-3 py-3 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between" v-if="pagination.total > 0">
              <p class="text-xs xs:text-xs text-gray-900">
                Showing {{ pagination.current_page }} to {{ pagination.last_page }} of {{ pagination.total }} Entries
              </p>
              <div class="inline-flex mt-2 xs:mt-0">
                <button class="text-xs bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-l" @click="prevPage" :disabled="pagination.current_page === 1">Prev</button>
                <button class="text-xs bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-r" @click="nextPage" :disabled="pagination.current_page === pagination.last_page">
                  Next
                </button>
              </div>
            </div>



          </div>
        </div>

      </div>

    </section>

    <section class="modal-box">
      <transition name="fade" appear>
        <div
            class="modal-overlay"
            v-if="showModal"
            @click="closeModal"
        ></div>
      </transition>
      <transition name="top" appear>
        <div class="modal" role="dialog" v-if="showModal">
          <div class="flex items-center justify-between border-b-2 border-dashed pb-4 mb-5">
            <div>
              <img src="/favicon.ico" alt="favicon" @click="closeModal" class="cursor-pointer" />
            </div>
          </div>

          <div class="space-y-3">
            <p>
              Sus datos personales serán utilizados por Interseguro Compañía de Seguros S.A. (INTERSEGURO) para las
              siguientes finalidades:
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi culpa distinctio doloremque doloribus eaque earum, est et facilis illo, impedit iure perferendis quae quo ratione rerum totam unde vel veritatis.
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. A accusantium aperiam consequatur cum cupiditate deleniti earum inventore iusto magni molestiae necessitatibus numquam, repudiandae rerum sint sunt suscipit temporibus velit voluptatum!
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Laborum, quaerat recusandae. Adipisci aperiam, cupiditate, dicta dignissimos excepturi impedit nemo nihil, nisi officiis rerum suscipit ullam. Dignissimos dolor perferendis quidem repellendus?
              Sus datos personales serán utilizados por Interseguro Compañía de Seguros S.A. (INTERSEGURO) para las
            </p>
          </div>
        </div>
      </transition>
    </section>


    <!-- Footer -->
<!--    <footer class="text-xs text-center p-4">-->
<!--      <p>&copy; 2024 Mi Empresa. Todos los derechos reservados.</p>-->
<!--    </footer>-->
  </div>



</template>