import React from 'react'
import { Card, CardContent, CardTitle } from '../ui/card'

interface IActionCard {
  header: string | React.ReactNode
  body?: React.ReactNode
  actions?: React.ReactNode[]
  dialog?: boolean
}

const ActionCard = ({ header, body, actions, dialog = false }: IActionCard) => {
  if (dialog) {
    return (
      <Card className="w-full py-2.5! shadow-none rounded-none border-0">
        <CardContent className="flex-col px-0!">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <CardTitle>{header}</CardTitle>
              {body}
            </div>
            <div className="flex gap-2">
              {actions?.map((action, index) => <React.Fragment key={index}>{action}</React.Fragment>)}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full py-3!">
      <CardContent className="flex-col pl-3 pr-3! md:pl-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <CardTitle>{header}</CardTitle>
            {body}
          </div>
          <div className="flex gap-2">
            {actions?.map((action, index) => <React.Fragment key={index}>{action}</React.Fragment>)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ActionCard
