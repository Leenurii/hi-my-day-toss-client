import { useState } from 'react'
import {
  FixedBottomCTA,
  Asset,
  TextField,
  SegmentedControl,
  TextArea,
  Post,
  Paragraph,
  useDialog
} from '@toss/tds-mobile'
import { apiFetch } from '@/libs/api'
import { useNavigate } from 'react-router-dom'
import { formatApiError } from '@/libs/errors'

type WeatherKey = 'sunny' | 'cloudy' | 'rainy' | 'snowy'
type MoodKey = 'very_bad' | 'bad' | 'neutral' | 'good' | 'very_good'

const WEATHER: Record<WeatherKey, { label: string; emojiSrc: string }> = {
  sunny:  { label: '맑음',  emojiSrc: 'https://static.toss.im/3d-emojis/u2600.png' },
  cloudy: { label: '흐림',  emojiSrc: 'https://static.toss.im/3d-emojis/u2601.png' },
  rainy:  { label: '비옴',  emojiSrc: 'https://static.toss.im/3d-emojis/u2614.png' },
  snowy:  { label: '눈',    emojiSrc: 'https://static.toss.im/3d-emojis/u2603.png' },
}

const MOOD: Record<MoodKey, { label: string; emojiSrc: string }> = {
  very_bad: { label: '나쁨',      emojiSrc: 'https://static.toss.im/3d-emojis/u1F614.png' },
  bad:      { label: '조금 나쁨', emojiSrc: 'https://static.toss.im/3d-emojis/u1F615.png' },
  neutral:  { label: '보통',      emojiSrc: 'https://static.toss.im/3d-emojis/u1F610.png' },
  good:     { label: '좋음',      emojiSrc: 'https://static.toss.im/3d-emojis/u1F603.png' },
  very_good:{ label: '아주좋음',  emojiSrc: 'https://static.toss.im/3d-emojis/u1F60D.png' },
}

export default function Write() {
  const navigate = useNavigate()
  const { openAlert } = useDialog()

  // 로딩 상태
  const [loading, setLoading] = useState(false)

  // 입력 상태
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')

  // 선택 상태
  const [weather, setWeather] = useState<WeatherKey>('sunny')
  const [mood, setMood] = useState<MoodKey>('good')

  // 검증: 공백/개행 포함 "문자 수" 기준
  const MIN_CHARS = 50
  const charCount = text.length
  const hasError = charCount > 0 && charCount < MIN_CHARS

  const titleError = title.trim().length < 2
  const bodyError = hasError

  const helpText = bodyError
    ? `${MIN_CHARS}자 이상 작성해 주세요. (현재 ${charCount}자)`
    : `${charCount}자`

  const onSaveAnalyze = async () => {
    // 이미 전송 중이면 중복 실행 막기
    if (loading) return

    setLoading(true)

    try {
      const payload = {
        title: title.trim(),
        meta: { weather, mood },
        original_lang: 'en',
        original_text: text,
      }

      const entry = await apiFetch<{ id: number }>('/api/entries/', {
        method: 'POST',
        body: payload,
      })

      await apiFetch(`/api/entries/${entry.id}/analyze/`, { method: 'POST' })

      // 성공하면 디테일 페이지로 이동
      navigate(`/entries/${entry.id}`)
    } catch (err: unknown) {
      // 실패 시 얼럿
      openAlert({
        title: '분석 실패',
        description: formatApiError(err),
        alertButton: '확인',
      })
      // 실패했으니까 다시 작성 가능하게 로딩 off
      setLoading(false)
    }
  }

  const isDisabled =
    loading ||
    !title.trim() ||
    !text.trim() ||
    titleError ||
    bodyError

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ padding: 16, paddingBottom: 120 }}>
        {/* 제목 */}
        <section style={{ marginTop: 8 }}>
          <TextField
            variant="line"
            label="일기 제목"
            labelOption="sustain"
            placeholder="예: A small win at work"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            hasError={title.length > 0 && titleError}
            help={title.length > 0 && titleError ? '2글자 이상 입력해 주세요.' : null}
            disabled={loading}
          />
        </section>

        {/* 기분 선택 */}
        <section style={{ marginTop: 16 }}>
          <Post.Paragraph paddingBottom={16} typography="t6">
            <Paragraph.Text>오늘의 기분</Paragraph.Text>
          </Post.Paragraph>

          <SegmentedControl
            alignment="fixed"
            value={mood}
            size="large"
            name="mood"
            onChange={(v: string) => setMood(v as MoodKey)}
            disabled={loading}
          >
            {(Object.keys(MOOD) as MoodKey[]).map((k) => (
              <SegmentedControl.Item key={k} value={k}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <Asset.Image
                    frameShape={Asset.frameShape.CleanW24}
                    backgroundColor="transparent"
                    src={MOOD[k].emojiSrc}
                    aria-hidden
                    style={{ aspectRatio: '1/1' }}
                  />
                </div>
              </SegmentedControl.Item>
            ))}
          </SegmentedControl>
        </section>

        {/* 날씨 선택 */}
        <section style={{ marginTop: 16 }}>
          <Post.Paragraph paddingBottom={16} typography="t6">
            <Paragraph.Text>오늘의 날씨</Paragraph.Text>
          </Post.Paragraph>

          <SegmentedControl
            alignment="fixed"
            value={weather}
            size="large"
            name="weather"
            onChange={(v: string) => setWeather(v as WeatherKey)}
            disabled={loading}
          >
            {(Object.keys(WEATHER) as WeatherKey[]).map((k) => (
              <SegmentedControl.Item key={k} value={k}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <Asset.Image
                    frameShape={Asset.frameShape.CleanW24}
                    backgroundColor="transparent"
                    src={WEATHER[k].emojiSrc}
                    aria-hidden
                    style={{ aspectRatio: '1/1' }}
                  />
                </div>
              </SegmentedControl.Item>
            ))}
          </SegmentedControl>
        </section>

        {/* 본문 입력 */}
        <section style={{ marginTop: 16 }}>
          <TextArea
            variant="box"
            height="200px"
            placeholder="Write freely about your day in English."
            value={text}
            onChange={(e) => setText(e.target.value)}
            hasError={bodyError}
            help={helpText}
            disabled={loading}
          />
        </section>
      </main>

      <footer>
        <FixedBottomCTA
          loading={loading}         
          {...({ onClick: onSaveAnalyze } as any)}
          disabled={isDisabled}     
        >
          저장하고 AI 분석 받기
        </FixedBottomCTA>
      </footer>
    </div>
  )
}
