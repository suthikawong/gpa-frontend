import { useRouter } from '@tanstack/react-router'

const TopicCard = ({ number, title, href }: { number: number; title: string; href: string }) => {
  const router = useRouter()

  const onClickCard = () => {
    router.history.push(href)
  }
  return (
    <div
      onClick={onClickCard}
      className="flex items-center gap-4 bg-white rounded-lg p-2 md:p-4 h-[60px] md:h-[100px] transition-colors duration-200 ease-in-out hover:cursor-pointer hover:bg-secondary"
    >
      <div className="flex justify-center items-center font-semibold text-lg md:text-2xl bg-primary rounded-lg min-w-[40px] size-[40px] md:min-w-[70px] md:size-[70px] text-white">
        {number}
      </div>
      <h2 className="text-sm md:text-lg font-semibold grow-0">{title}</h2>
    </div>
  )
}

export default TopicCard
