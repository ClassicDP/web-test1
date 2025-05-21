// src/router.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import StudentRegister from '../pages/StudentRegister.vue';
import AttemptTest from '../pages/AttemptTest.vue';
import AttemptResult from '../pages/AttemptResult.vue';

const routes: RouteRecordRaw[] = [
    { path: '/', name: 'StudentRegister', component: StudentRegister },
    { path: '/attempt/:uniqueUrl', name: 'AttemptTest', component: AttemptTest, props: true },
    { path: '/result/:uniqueUrl', name: 'AttemptResult', component: AttemptResult, props: true },
];

export default createRouter({
    history: createWebHistory(),
    routes,
});
