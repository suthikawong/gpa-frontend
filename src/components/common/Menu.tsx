import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { appPaths, instructorMenuItems, profileMenuItem, Roles, studentMenuItems } from '@/config/app'
import { useAuth } from '@/hooks/auth'
import { cn } from '@/lib/utils'
import { Link, useRouter } from '@tanstack/react-router'
import { FlaskConical, ListChecks, LogOut, Menu as LucideMenu, UserRound } from 'lucide-react'
import React, { useState } from 'react'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Label } from '../ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Separator } from '../ui/separator'

interface MenuItem {
  name: string
  icon: string
  href: string
  onClick?: () => void
}

const iconMap = {
  ListChecks: ListChecks,
  FlaskConical: FlaskConical,
  UserRound: UserRound,
  LogOut: LogOut,
}

export default function Menu() {
  const router = useRouter()
  const { user, setUser } = useAuth()
  const [open, setOpen] = useState(false)

  const menuItems = user?.roleId === Roles.Instructor ? instructorMenuItems : studentMenuItems

  const onClickSignout = async () => {
    await api.auth.logout()
    setUser(undefined)
    router.history.push('/signin')
  }

  const signOutMenuItem: MenuItem = {
    name: 'Sign Out',
    icon: 'LogOut',
    href: appPaths.signIn,
    onClick: onClickSignout,
  }

  return (
    <header className="w-full border-b shadow-sm px-6 flex items-center justify-between flex-grow bg-primary-foreground min-h-[52px] max-h-[52px] md:min-h-[68px] md:max-h-[68px]">
      <div className="flex items-center gap-2">
        <AppLogo />
      </div>

      {/* Desktop Menu */}
      <div className="flex items-center gap-4">
        <nav className="hidden md:flex gap-4 items-center py-4 ml-6">
          {menuItems.map((item, index) => {
            if (item.href === appPaths.profile) return null
            return (
              <MenuItem
                key={index}
                data={item}
                setOpen={setOpen}
              />
            )
          })}
        </nav>

        <div className="hidden md:flex gap-4 items-center">
          <ProfilePopover />
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <Sheet
          open={open}
          onOpenChange={setOpen}
        >
          {user?.userId && (
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
              >
                <LucideMenu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
          )}
          <SheetContent
            side="left"
            className="w-full max-w-[280px] bg-primary-foreground px-6 flex-col"
          >
            <SheetHeader className="p-0 pt-6">
              <SheetTitle className="hidden">Menu</SheetTitle>
              <SheetDescription className="hidden">User information</SheetDescription>
              <div className="flex gap-x-4 items-center">
                <Avatar className="size-12">
                  {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
                  <AvatarFallback>{user?.name?.[0] ?? ''}</AvatarFallback>
                </Avatar>
                <div className="space-y-0.5 min-w-0">
                  <Label className="text-[10px] text-muted-foreground">{user?.roleId ? Roles[user.roleId] : '-'}</Label>
                  <Label className="block truncate">{user?.name ?? '-'}</Label>
                </div>
              </div>
            </SheetHeader>
            <Separator />
            <div className="flex flex-col gap-4 pt-2 flex-grow">
              {menuItems.map((item, index) => (
                <MenuItem
                  key={index}
                  data={item}
                  setOpen={setOpen}
                />
              ))}
            </div>
            <div className="pb-6">
              <MenuItem
                data={signOutMenuItem}
                setOpen={setOpen}
                className="text-destructive"
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

const AppLogo = ({ className }: { className?: string }) => {
  return <div className={cn('text-xl font-bold text-primary', className)}>ScoreUnity</div>
}

const MenuItem = ({
  data,
  setOpen,
  className,
  isPopover = false,
}: {
  data: MenuItem
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  className?: string
  isPopover?: boolean
}) => {
  const router = useRouter()
  const isActive = router.state.location.pathname.split('/').slice(0, 3).join('/') === data.href
  const IconComponent = iconMap[data.icon as keyof typeof iconMap]

  return (
    <div className={cn('flex items-center gap-3 md:gap-2 group', isPopover && 'p-2 rounded-md hover:bg-primary/10')}>
      {IconComponent && (
        <IconComponent
          size={18}
          className={cn(
            'md:group-hover:text-primary',
            // !isPopover && 'md:hidden',
            isActive ? 'text-primary' : 'text-muted-foreground',
            className
          )}
        />
      )}
      <Link
        key={data.name}
        to={data.href}
        className={cn(
          'font-medium text-sm text-muted-foreground md:group-hover:text-primary transition-colors',
          isActive && 'text-primary',
          className
        )}
        onClick={() => {
          data?.onClick?.()
          setOpen(false)
        }}
      >
        {data.name}
      </Link>
    </div>
  )
}

const ProfilePopover = () => {
  const router = useRouter()
  const { user, setUser } = useAuth()
  const [open, setOpen] = useState(false)

  const onClickSignout = async () => {
    await api.auth.logout()
    setUser(undefined)
    router.history.push('/signin')
  }

  const signOutMenuItem: MenuItem = {
    name: 'Sign Out',
    icon: 'LogOut',
    href: appPaths.signIn,
    onClick: onClickSignout,
  }

  return (
    <Popover
      open={open}
      onOpenChange={(value) => setOpen(value)}
    >
      <PopoverTrigger asChild>
        <Avatar className="size-10 cursor-pointer">
          {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
          <AvatarFallback>{user?.name?.[0] ?? ''}</AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent className="w-70 mr-6 mt-1">
        <div className="flex gap-x-4 items-center">
          <Avatar className="size-12">
            {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
            <AvatarFallback>{user?.name?.[0] ?? ''}</AvatarFallback>
          </Avatar>
          <div className="space-y-0.5 min-w-0">
            <Label className="text-[10px] text-muted-foreground">{user?.roleId ? Roles[user.roleId] : '-'}</Label>
            <Label className="block truncate">{user?.name ?? '-'}</Label>
          </div>
        </div>
        <Separator className="mt-4 mb-2" />
        <div>
          <MenuItem
            data={profileMenuItem}
            setOpen={setOpen}
            isPopover={true}
          />
          <MenuItem
            data={signOutMenuItem}
            setOpen={setOpen}
            isPopover={true}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
