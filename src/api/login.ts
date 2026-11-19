import request from '@/utils/request'
import { useAPI } from '@/utils/useAPI'
import type { SysRegister, LoginInfoResult, UserInfoResult, CaptchaInfoResult, AjaxResult } from '@/types'

// 登录模块接口集中管理
export enum LOGIN_API {
  LOGIN = 'POST:/login',
  REGISTER = 'POST:/register',
  GET_INFO = 'GET:/getInfo',
  UNLOCK_SCREEN = 'POST:/unlockscreen',
  LOGOUT = 'POST:/logout',
  CAPTCHA_IMAGE = 'GET:/captchaImage'
}

// 登录方法
export function login(username: string, password: string, code: string, uuid: string): Promise<LoginInfoResult> {
  const { basePath, method } = useAPI(LOGIN_API.LOGIN)
  const data = {
    username,
    password,
    code,
    uuid
  }
  return request({
    url: basePath,
    headers: {
      isToken: false,
      repeatSubmit: false
    },
    method,
    data: data
  })
}

// 注册方法
export function register(data: SysRegister): Promise<AjaxResult> {
  const { basePath, method } = useAPI(LOGIN_API.REGISTER)
  return request({
    url: basePath,
    headers: {
      isToken: false
    },
    method,
    data: data
  })
}

// 获取用户详细信息
export function getInfo(): Promise<UserInfoResult> {
  const { basePath, method } = useAPI(LOGIN_API.GET_INFO)
  return request({
    url: basePath,
    method
  })
}

// 解锁屏幕
export function unlockScreen(password: string) {
  const { basePath, method } = useAPI(LOGIN_API.UNLOCK_SCREEN)
  return request({
    url: basePath,
    method,
    data: { password }
  })
}

// 退出方法
export function logout() {
  const { basePath, method } = useAPI(LOGIN_API.LOGOUT)
  return request({
    url: basePath,
    method
  })
}

// 获取验证码
export function getCodeImg(): Promise<CaptchaInfoResult> {
  const { basePath, method } = useAPI(LOGIN_API.CAPTCHA_IMAGE)
  return request({
    url: basePath,
    headers: {
      isToken: false
    },
    method,
    timeout: 20000
  })
}
