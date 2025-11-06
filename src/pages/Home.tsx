import '../App.css'
import 'react-calendar/dist/Calendar.css'
import { useEffect, useMemo, useState } from 'react'
import { Top, FixedBottomCTA, Asset} from '@toss/tds-mobile'
import Calendar from 'react-calendar'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import QuoteCarousel from '@/components/QuoteCarousel'
import { apiFetch } from '@/libs/api'   

// 애니메이션 variants
const container: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5, 
      when: 'beforeChildren',
      staggerChildren: 0.08,
    },
  },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

// 로컬(한국시간) 기준 YYYY-MM-DD
const localDateKey = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function Home() {
  const navigate = useNavigate()
  const [value, setValue] = useState<Date>(new Date())

  // ✅ API 데이터 상태
  const [calendarMap, setCalendarMap] = useState<Record<string, number>>({})
  const [quotes, setQuotes] = useState<Array<{ en: string; ko: string }>>([])

  // 현재 달 기준으로 달력 데이터 로드
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')

  useEffect(() => {
    let alive = true
    console.log('fetching calendar for', `${year}-${month}`)
    ;(async () => {
      try {
        // const data = await apiFetch<Record<string, number>>(
        //   `/api/entries/?calendar=1&month=${year}-${month}&dev_dummy=1`
        // )
        const data = await apiFetch<Record<string, number>>(
          `/api/entries/?calendar=1&month=${year}-${month}`
        )
        if (alive) setCalendarMap(data || {})
      } catch (e) {
        console.warn('calendar load error', e)
        if (alive) setCalendarMap({})
      }
    })()
    return () => { alive = false }
  }, [year, month])

  // 오늘의 문장 3개 가져오기
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const data = await apiFetch<Array<{ en: string; ko: string }>>('/api/quotes/', { skipAuth: true })
        if (alive) setQuotes(data || [])
      } catch (e) {
        console.warn('quotes load error', e)
      }
    })()
    return () => { alive = false }
  }, [])

  // 유틸
  const hasEntry = (date: Date) => !!calendarMap[localDateKey(date)]

  const handleClickDay = async (date: Date) => {
    const key = localDateKey(date)
    try {
      // 해당 날짜의 엔트리가 있는지 조회
      const res = await apiFetch<{ exists: boolean; entry?: { id: number } }>(
        `/api/entries/by-date/?date=${key}`
      )

      if (res?.exists && res.entry?.id) {
        // 이미 작성된 날 → 결과 페이지로
        navigate(`/entries/${res.entry.id}`)
      } else {
        // 아직 없음 → 해당 날짜로 쓰기 페이지
        navigate(`/write?date=${key}`)
      }
    } catch (e: any) {
      // (예: 401 등) 에러 시엔 일단 쓰기 페이지로 폴백
      console.warn('by-date check error:', e?.message || e)
      navigate(`/write?date=${key}`)
    }
  }

  const tileClassName = ({ date, view }: { date: Date; view: string }) =>
    view === 'month' && hasEntry(date) ? 'rc-has-entry' : undefined

  const totalThisMonth = useMemo(() => {
    const prefix = `${year}-${month}-`
    return Object.keys(calendarMap).filter(k => k.startsWith(prefix)).length
  }, [calendarMap, year, month])

  // ✅ 추가: 오늘 버튼 로직 (중복 작성 방지)
  const goToday = async () => {
    const today = new Date()
    const key = localDateKey(today)

    try {
      const res = await apiFetch<{ exists: boolean; entry?: { id: number } }>(
        `/api/entries/by-date/?date=${key}`
      )

      if (res?.exists && res.entry?.id) {
        // 오늘 이미 쓴 일기가 있으면 → 분석 결과 페이지로 이동
        navigate(`/entries/${res.entry.id}`)
      } else {
        // 없으면 → 오늘 날짜로 쓰기 시작
        navigate(`/write?date=${key}`)
      }
    } catch (e: any) {
      console.warn('goToday check error:', e?.message || e)
      navigate(`/write?date=${key}`)
    }
  }

  return (
    <>
      <header>
        <Top 
          upperGap={0}
          title={
            <Top.TitleParagraph>
              오늘은 어떤 하루였나요?
              <Asset.Image
                frameShape={Asset.frameShape.CleanW24}
                backgroundColor="transparent"
                src="https://static.toss.im/2d-emojis/png/4x/u1F60E.png"
                aria-hidden={true}
                style={{ aspectRatio: `1/1` }}
              />
            </Top.TitleParagraph>
          }
          subtitleTop={<Top.SubtitleParagraph>간단하게라도 좋아요</Top.SubtitleParagraph>}
        />
      </header>

      <main style={{ padding: 16, paddingBottom: 120, marginTop: -26 }}>
        <motion.div variants={container} initial="hidden" animate="show" style={{ willChange: 'transform,opacity' }}>
          
          {/* 오늘 날짜 / 요약 */}
          <motion.section variants={item} style={{ marginBottom: 16 }}>
            <div
              style={{
                borderRadius: 16,
                background: '#F9FAFB',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 14, color: '#6B7280' }}>
                  {value.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                </div>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#111' }}>
                  이번 달 {totalThisMonth}회 작성
                </div>
              </div>
              <div
                style={{
                  width: 48, height: 48, background: '#E5F0FF', borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                }}
              >
                ✍️
              </div>
            </div>
          </motion.section>

          {/* 오늘의 문장 */}
          <motion.section variants={item} style={{ marginBottom: 24 }}>
            <QuoteCarousel
              items={
                quotes.length
                  ? quotes
                  : [
                      { en: 'Consistency beats perfection.', ko: '꾸준함은 완벽함을 이깁니다.' },
                      { en: 'Small steps make big changes.', ko: '작은 걸음이 큰 변화를 만듭니다.' },
                      { en: 'Learn something new every day.', ko: '매일 새로운 것을 배우세요.' },
                    ]
              }
              intervalMs={3500}
            />
          </motion.section>

          {/* 캘린더 */}
          <motion.section variants={item} style={{ marginBottom: 24 }}>
            <Calendar
              locale="ko-KR"
              value={value}
              onChange={(v) => setValue(v as Date)}
              onClickDay={handleClickDay}
              tileClassName={tileClassName}
            />
          </motion.section>

        </motion.div>
      </main>

      <footer>
        {/* ✅ 여기 onClick을 goToday로 변경 */}
        <FixedBottomCTA {...({ onClick: goToday } as any)}>
          오늘 일기 쓰러 가기 ✍️
        </FixedBottomCTA>
      </footer>
    </>
  )
}
