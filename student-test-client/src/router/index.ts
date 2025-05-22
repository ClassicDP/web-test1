import { createRouter, createWebHistory } from 'vue-router';
import TestManagementPage from '../pages/TestManagementPage.vue';
import AttemptTest from '../pages/AttemptTest.vue';
import AttemptResult from '../pages/AttemptResult.vue';
import TestList from '../pages/TestList.vue';
import TestEditor from '../pages/TestEditor.vue';

const routes = [
    { path: '/', component: TestManagementPage },
    { path: '/attempt/:uniqueUrl', component: AttemptTest },
    { path: '/result/:uniqueUrl', component: AttemptResult },
    { path: '/tests', component: TestList },
    { path: '/tests/new', component: TestEditor },
    { path: '/tests/:id/edit', component: TestEditor },
];

export default createRouter({
    history: createWebHistory(),
    routes,
});
