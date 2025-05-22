// src/router.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import AttemptTest from '../pages/AttemptTest.vue';
import AttemptResult from '../pages/AttemptResult.vue';
import EditableStudentsTable from '../pages/EditableStudentsTable.vue';

const routes: RouteRecordRaw[] = [
    { path: '/attempt/:uniqueUrl', name: 'AttemptTest', component: AttemptTest, props: true },
    { path: '/result/:uniqueUrl', name: 'AttemptResult', component: AttemptResult, props: true },
    { path: '/', name: 'EditableStudentsTable', component: EditableStudentsTable },
];

export default createRouter({
    history: createWebHistory(),
    routes,
});
