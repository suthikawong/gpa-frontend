import { toast } from 'sonner'

const rootStyles = getComputedStyle(document.documentElement)

const errorToast = (message: string) => {
  const destructive = rootStyles.getPropertyValue('--destructive')
  const destructiveForeground = rootStyles.getPropertyValue('--destructive-foreground')
  return toast.error(message, {
    style: {
      background: destructive,
      color: destructiveForeground,
    },
  })
}

const successToast = (message: string) => {
  const success = rootStyles.getPropertyValue('--success')
  const successForeground = rootStyles.getPropertyValue('--success-foreground')
  return toast.success(message, {
    style: {
      background: success,
      color: successForeground,
    },
  })
}

export default {
  error: errorToast,
  success: successToast,
}
