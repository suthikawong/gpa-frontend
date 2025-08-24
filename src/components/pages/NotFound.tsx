import notFound from '@/assets/404.svg'
import { Button } from '../ui/button'
import { useRouter } from '@tanstack/react-router'

const NotFound = () => {
  const router = useRouter()

  const onClickBackToHome = () => {
    router.history.push('/')
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-white">
      <img
        src={notFound}
        alt="Not found image"
        className="max-w-[728px] pr-[28px]"
      />
      <h1 className="text-3xl font-bold ">Oops! Page not found.</h1>
      <Button
        size="lg"
        className="mt-6"
        onClick={onClickBackToHome}
      >
        Back to Home
      </Button>
    </div>
  )
}

export default NotFound
