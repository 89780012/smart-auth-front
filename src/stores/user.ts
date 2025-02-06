import { defineStore } from 'pinia'
import { login , logout, type User } from '@/api/user'

interface UserState {
  token: string,
  currentUser: User | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: '',
    currentUser: null
  }),
  
  getters: {
    // 获取用户信息
    getUserInfo: (state) => state.currentUser,
    // 判断是否登录
    isLoggedIn: (state) => !!state.token
  },

  actions: {
    async login(username: string, password: string) {
      try {
        const data = await login({ username, password })
        return data
      } catch (error) {
        localStorage.removeItem("token")
        throw error
      }
    },

    setToken(token: string) {
      localStorage.setItem("token",token)
    },

    getToken() {

      return localStorage.getItem("token")
    },

    async logout() {
      await logout()
      this.token = ''
      this.currentUser = null
      localStorage.removeItem("token")
    },

    // 设置用户信息
    setCurrentUser(user: User) {
      this.currentUser = user
    },
  },

  persist: {
    enabled: true,
    strategies: [{
      storage: localStorage,
      paths: ['token', 'currentUser']
    }]
  }
})