import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import UserLocation from '@/pages/UserLocation'
import CloseBuy from '@/pages/CloseBuy'
import DistanceMatric from '@/pages/DistanceMatric'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: UserLocation
    },
    {
      path: '/distance-matric',
      component: DistanceMatric
    },
    {
      path: '/close-buy',
      component: CloseBuy
    },
  ]
})
