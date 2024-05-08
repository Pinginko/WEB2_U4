import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';   
import Row from 'primevue/row';                   

const app = createApp(App)

app.use(PrimeVue);
app.use(router)
app.component('DataTable', DataTable);
app.component('Column', Column); 
app.component('ColumnGroup', ColumnGroup);  
app.component('Row', Row);     
app.mount('#app')
