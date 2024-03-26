import { createRouter, createWebHistory } from 'vue-router';

const Routes = [
	{
		path: '/map',
		component: () => import('@/views/initMap.vue')
	}
];

// 路由实例
const router = createRouter({
	history: createWebHistory(),
	routes: Routes
});

export default router;
