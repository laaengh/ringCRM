import { requireAuth } from './navigationGuards'

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'brreg-search', component: () => import('pages/BrregSearch.vue') },
      { path: 'potential-customers', component: () => import('pages/PotentialCustomers.vue') },
      { path: 'customer-list', component: () => import('pages/CustomerList.vue') },
      { beforeEnter: requireAuth },
    ]
  },


  // Auth routes (register / login / logout)
  {
    path: '/auth',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'register',
        component: () => import('pages/auth/RegisterPage.vue'),
        name: 'RegisterPage',
      },
      { path: 'login', component: () => import('pages/auth/LoginPage.vue'), name: 'LoginPage' },
      { path: 'logout', component: () => import('pages/auth/LogoutPage.vue'), name: 'LogoutPage' },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
