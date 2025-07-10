import { assessment } from './assessment'
import { auth } from './auth'
import { group } from './group'
import { lookup } from './lookup'
import { peerRating } from './peer-rating'
import { scoringComponent } from './scoring-component'
import { user } from './user'

export const api = {
  auth,
  user,
  assessment,
  group,
  scoringComponent,
  peerRating,
  lookup,
}
