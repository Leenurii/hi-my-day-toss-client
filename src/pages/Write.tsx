import { useEffect, useState, useCallback } from 'react'
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
import { GoogleAdMob } from '@apps-in-toss/web-framework'  // ✅ 추가

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
const hasKorean = (text: string) => /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text)

// ✅ 콘솔에서 발급받은 광고 그룹 ID 넣기
const AD_GROUP_ID = 'ait.live.15ff19efe8eb4a66'

type AdLoadStatus = 'not_loaded' | 'loaded' | 'failed'

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

  // ✅ 광고 로드 상태
  const [adLoadStatus, setAdLoadStatus] = useState<AdLoadStatus>('not_loaded')

  // 검증
  const MIN_CHARS = 50
  const charCount = text.length

  const containsKoreanInTitle = hasKorean(title)
  const containsKoreanInBody = hasKorean(text)

  const lengthError = charCount > 0 && charCount < MIN_CHARS

  const titleError =
    title.trim().length < 2 || containsKoreanInTitle

  const bodyError =
    lengthError || containsKoreanInBody

  const helpText = containsKoreanInBody
    ? '영어로만 작성해 주세요. 한글은 사용할 수 없어요.'
    : lengthError
      ? `${MIN_CHARS}자 이상 작성해 주세요. (현재 ${charCount}자)`
      : `${charCount}자`


  const isDisabled =
    loading ||
    !title.trim() ||
    !text.trim() ||
    titleError ||
    bodyError

  // ✅ 광고 미리 로드하는 함수
  const loadAd = useCallback(() => {
    if (GoogleAdMob.loadAppsInTossAdMob.isSupported() !== true) {
      console.log('AdMob not supported in this environment')
      return
    }

    setAdLoadStatus('not_loaded')

    const cleanup = GoogleAdMob.loadAppsInTossAdMob({
      options: {
        adGroupId: AD_GROUP_ID,
      },
      onEvent: (event) => {
        console.log('[AdMob load event]', event.type, event.data)
        switch (event.type) {
          case 'loaded':
            setAdLoadStatus('loaded')
            break
          // 필요하다면 다른 이벤트도 핸들링 가능
        }
      },
      onError: (error) => {
        console.error('광고 불러오기 실패', error)
        setAdLoadStatus('failed')
      },
    })

    return cleanup
  }, [])

  // ✅ 페이지 진입 시 한 번 광고 로드
  useEffect(() => {
    const cleanup = loadAd()
    return () => {
      // loadAppsInTossAdMob가 반환하는 cleanup 있으면 실행
      if (typeof cleanup === 'function') {
        cleanup()
      }
    }
  }, [loadAd])

  // ✅ 실제로 API를 호출해서 저장 + 분석하는 함수 (기존 onSaveAnalyze 분리)
  const runAnalyze = async () => {
    if (loading) return

    if (hasKorean(title) || hasKorean(text)) {
      openAlert({
        title: '영어로만 작성해 주세요',
        description: '현재 한글이 포함되어 있어요. 한글 대신 쉬운 영어로 적어볼까요?',
        alertButton: '확인',
      })
      return
    }

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

      navigate(`/entries/${entry.id}`)
    } catch (err: unknown) {
      openAlert({
        title: '분석 실패',
        description: formatApiError(err),
        alertButton: '확인',
      })
      setLoading(false)
    }
  }

  // ✅ 버튼 클릭 시: 광고 보여주고, 보상 획득 시 runAnalyze 실행
  const handleClickAnalyze = () => {
    if (loading) return
    if (isDisabled) return

    // AdMob 지원 + 로드된 상태면 → 광고 먼저
    if (
      GoogleAdMob.showAppsInTossAdMob.isSupported() === true &&
      adLoadStatus === 'loaded'
    ) {
      GoogleAdMob.showAppsInTossAdMob({
        options: {
          adGroupId: AD_GROUP_ID,
        },
        onEvent: (event) => {
          console.log('[AdMob show event]', event.type, event.data)

          switch (event.type) {
            case 'requested':
              // 한 번 보여줬으니 다시 로드할 준비
              setAdLoadStatus('not_loaded')
              // 필요하면 여기서 loadAd() 다시 호출해도 됨
              break

            case 'userEarnedReward':
              console.log('사용자가 광고를 끝까지 봤습니다. 분석 실행!')
              runAnalyze()
              break

            case 'failedToShow':
              console.log('광고 보여주기 실패, 그냥 무료로 분석 진행')
              runAnalyze()
              break

            case 'dismissed':
              console.log('광고 닫힘, 보상 미지급 → 분석 안 함')
              // 여기서는 그냥 조용히 두고, 유저가 다시 버튼 누르게 둠
              break
          }
        },
        onError: (error) => {
          console.error('광고 보여주기 실패', error)
          // 광고 자체 문제면 유저에게는 손해 안 보게 그냥 분석 실행
          runAnalyze()
        },
      })
    } else {
      // 광고 미지원/미로드 시 → 그냥 분석 실행 (웹, 개발 환경 등)
      console.log('Ad not loaded or not supported, run analyze directly')
      runAnalyze()
    }
  }

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
            help={
              title.length > 0 && containsKoreanInTitle
                ? '제목은 영어로만 작성해 주세요.'
                : title.length > 0 && title.trim().length < 2
                  ? '2글자 이상 입력해 주세요.'
                  : null
            }
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
          disabled={isDisabled}
          {...({ onClick: handleClickAnalyze } as any)}  
        >
          저장하고 AI 분석 받기
        </FixedBottomCTA>
      </footer>
    </div>
  )
}
