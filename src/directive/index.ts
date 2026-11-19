import { App } from 'vue'
import hasRole from './permission/hasRole'
import hasPermi from './permission/hasPermi'
import hasApi from './permission/hasApi'
import copyText from './common/copyText'

export default function directive(app: App){
  app.directive('hasRole', hasRole)
  app.directive('hasPermi', hasPermi)
  app.directive('hasApi', hasApi)
  app.directive('copyText', copyText)
}
