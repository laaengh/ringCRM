import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { getCurrentUser } from './navigationGuards'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHashHistory
      : createWebHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Global guard: require authentication for non-/auth routes.
  Router.beforeEach(async (to, from, next) => {
    // Allow auth routes (login/register/logout) without being authenticated
    if (to.path.startsWith('/auth') || to.name === undefined) {
      const currentUser = await getCurrentUser()

      // If an authenticated user tries to access login/register, send them home
      if ((to.name === 'LoginPage' || to.name === 'RegisterPage') && currentUser) {
        return next({ name: 'HomePage' })
      }

      return next()
    }

    // All other routes require authentication
    const currentUser = await getCurrentUser()
    if (currentUser) {
      return next()
    }

    return next({ name: 'LoginPage' })
  })

  return Router
})
