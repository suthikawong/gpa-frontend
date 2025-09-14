import InfoTooltip from '@/components/common/InfoTooltip'
import { Link } from '@tanstack/react-router'

export const ModelTooltip = () => {
  return (
    <InfoTooltip
      content={
        <div>
          <div>An assessment model that is used to calculate students' final scores.</div>
          <div>
            See&nbsp;
            <Link
              className="text-destructive"
              to="/instructor/tutorial/qass-terminology"
              target="_blank"
            >
              QASS&nbsp;
            </Link>
            and&nbsp;
            <Link
              className="text-destructive"
              to="/instructor/tutorial/webavalia-terminology"
              target="_blank"
            >
              WebAVALIA
            </Link>
          </div>
        </div>
      }
    />
  )
}

export const ModeTooltip = () => {
  const props = {
    to: '/instructor/tutorial/qass-terminology',
    className: 'text-destructive',
    target: '_blank',
  }
  return (
    <InfoTooltip
      content={
        <div>
          <div>A variant of QASS for peer assessment, defined by the rating question given to students.</div>
          <div>
            See&nbsp;
            <Link {...props}>Bijunction&nbsp;</Link>
            ,&nbsp;
            <Link {...props}>Conjunction&nbsp;</Link>
            and&nbsp;
            <Link {...props}>Disjunction</Link>
          </div>
        </div>
      }
    />
  )
}

export const PolishingFactorTooltip = () => {
  return (
    <InfoTooltip
      content={
        <div>
          <div>Technical parameter that excludes extreme scale values.</div>
          <div>The polishing factor must be greater than 0 and less than 0.5.</div>
        </div>
      }
    />
  )
}

export const PeerRatingImpactTooltip = () => {
  return (
    <InfoTooltip
      content={
        <div>
          <div>
            A parameter used to adjust the influence of student ratings, which affects the calculation of the final
            score.
          </div>
          <div>Peer rating impact must be greater than or equal to 0.</div>
        </div>
      }
    />
  )
}

export const GroupSpreadTooltip = () => {
  return (
    <InfoTooltip
      content={
        <div>
          <div>The measure of how far apart students' scores are within a group.</div>
          <div>Group spread must be greater than 0 and less than 1.</div>
        </div>
      }
    />
  )
}

export const GroupScoreTooltip = () => {
  return (
    <InfoTooltip
      content={
        <div>
          <div>The group location on the percentage scale represents product quality.</div>
          <div>Group score must be greater than 0 and less than 1.</div>
        </div>
      }
    />
  )
}

export const ScaleTooltip = () => {
  const props = {
    to: '/instructor/tutorial/qass-terminology',
    className: 'text-destructive',
    target: '_blank',
  }
  return (
    <InfoTooltip
      content={
        <div>
          <div>A defined range of values used for assigning ratings or scores in an assessment model.</div>
          <div>
            See&nbsp;
            <Link {...props}>Percentage scale&nbsp;</Link>
            and&nbsp;
            <Link {...props}>N-point scale</Link>
          </div>
        </div>
      }
    />
  )
}

export const ApplyConstraintTooltip = () => {
  return (
    <InfoTooltip content="When checked, it limits the scores that students can give according to the specified constraint." />
  )
}

export const ConstraintTooltip = () => {
  return (
    <InfoTooltip
      content={
        <div>
          <div>
            Constraint is a rule that restricts the range of values students can use when giving ratings or scores
          </div>
          <div>The constraint must be greater than 0 and less than or equal to 100.</div>
        </div>
      }
    />
  )
}

export const LowerBoundTooltip = () => {
  return <InfoTooltip content="The lowest number that defines a bounded scale." />
}

export const UpperBoundTooltip = () => {
  return <InfoTooltip content="The highest number that defines a bounded scale." />
}

export const ComponentTooltip = () => {
  return <InfoTooltip content="An independent instance of peer assessment producing a student contribution." />
}

export const ComponentWeightTooltip = () => {
  return (
    <InfoTooltip content="An integer that represents the importance of a student contribution in a given component. A higher value gives more weight to the ratings in that component." />
  )
}

export const StudentWeightTooltip = () => {
  return <InfoTooltip content="	An integer representing a student's relative importance." />
}

export const SelfAssessmentWeight = () => {
  return (
    <InfoTooltip
      content={
        <div>
          <div>Fixed weight for self-votes.</div>
          <div>The self-assessment weight must be between 0 and 1, inclusive.</div>
        </div>
      }
    />
  )
}

export const PeerAssessmentWeight = () => {
  return (
    <InfoTooltip
      content={
        <div>
          <div>Equal weights given to peer votes for a student.</div>
          <div>The peer-assessment weight must be between 0 and 1, inclusive.</div>
        </div>
      }
    />
  )
}

export const GroupGradeTooltip = () => {
  return (
    <InfoTooltip
      content={
        <div>
          <div className="flex">
            Model parameter given by the teacher for each component, based on quality criteria.
          </div>
          <div>The group grade must be between 0 and 20, inclusive.</div>
        </div>
      }
    />
  )
}
