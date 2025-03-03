import { Link } from '@tanstack/react-router'

const Menu = () => {
  return (
    <div className="w-40 h-full flex flex-col bg-white">
      <div className="text-4xl mb-4">Menu</div>
      <Link
        to="/"
        className="[&.active]:font-bold"
      >
        Home
      </Link>{' '}
      <Link
        to="/about"
        className="[&.active]:font-bold"
      >
        About
      </Link>
    </div>
  )
}

export default Menu
