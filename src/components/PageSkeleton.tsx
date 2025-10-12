// src/components/PageSkeleton.tsx
import { Skeleton } from '@toss/tds-mobile'

type Props =
  | { variant: 'topListWithIcon'; style?: React.CSSProperties }
  | { variant: 'entryResult'; style?: React.CSSProperties }
  | { variant: 'home'; style?: React.CSSProperties }

export default function PageSkeleton(props: Props) {
  if (props.variant === 'topListWithIcon') {
    return <Skeleton pattern="topListWithIcon" style={{ width: '100%', ...props.style }} />
  }

  if (props.variant === 'entryResult') {
    // 커스텀 패턴: 제목 + 부제목 + 카드 + 리스트
    return (
      <Skeleton
        custom={[
          'title',
          'subtitle',
          'spacer(12)',
          'card',
          'spacer(16)',
          'listWithIcon',
        ]}
        style={{ width: '100%', ...props.style }}
      />
    )
  }

  // home: 상단 요약카드 + 오늘의 문장 카드 + 리스트(예: 최근 피드백)
  return (
    <Skeleton
      custom={[
        'title',
        'spacer(10)',
        'card',
        'spacer(16)',
        'card',
        'spacer(16)',
        'listWithIcon',
      ]}
      style={{ width: '100%', ...props.style }}
    />
  )
}
