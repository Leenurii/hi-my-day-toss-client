import '../App.css'
import { Asset, ListRow, Top, FixedBottomCTA } from '@toss/tds-mobile'
import { appLogin } from '@apps-in-toss/web-framework'
import { useState } from 'react'
import { setJWT, setTossUserKey } from '@/libs/auth'
import { apiFetch } from '@/libs/api'
import { useNavigate } from 'react-router-dom'

// const APP_JWT_KEY = 'APP_JWT' // JWT 저장용 키

export default function Index() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()  

  async function handleStart() {
    try {
      
      setLoading(true)

      // 1️⃣ 토스 로그인 SDK 호출
      const { authorizationCode, referrer } = await appLogin()
      console.log('authorizationCode:', authorizationCode)
      console.log('referrer:', referrer)

      // 2️⃣ Django 서버로 authorizationCode, referrer 전달
      const data = await apiFetch<{ jwt: string; user?: { tossUserKey?: number } }>(
        '/api/accounts/toss-login',
        { method: 'POST', body: { authorizationCode, referrer }, skipAuth: true }
      )
      const appJWT = data?.jwt

      if (appJWT) {
        await setJWT(appJWT)
        if (data.user?.tossUserKey) await setTossUserKey(String(data.user.tossUserKey))
        navigate('/home')
      } else {
        alert('JWT를 받아오지 못했어요.')
        console.warn('응답 데이터:', data)
      }
    } catch (error) {
      console.error('로그인 에러:', error)
      alert('로그인 중 문제가 발생했어요.')
    } finally {
      setLoading(false)
    }
  }

  // async function handleDevSkip() {
  //   // 임의의 더미 JWT — 실제 검증은 안하지만 클라이언트 흐름 테스트용
  //   const dummy = 'dev.dummy.jwt.token'
  //   await setJWT(dummy)
  //   await setTossUserKey('1234567890')
  //   navigate('/home')
  // }

  // async function handleCheckLogin() {
  //   // 4️⃣ 저장된 JWT 확인
  //   const saved = await Storage.getItem(APP_JWT_KEY)
  //   if (saved) {
  //     alert('저장된 JWT:\n' + saved.substring(0, 40) + '...')
  //     setJwt(saved)
  //   } else {
  //     alert('로그인 기록이 없습니다.')
  //   }
  // }

  // async function handleLogout() {
  //   // 5️⃣ JWT 제거 (로그아웃)
  //   await Storage.removeItem(APP_JWT_KEY)
  //   setJwt(null)
  //   alert('로그아웃 되었습니다.')
  // }

  return (
    <>
      <header>
        <Top
          upperGap={0}
          title={<Top.TitleParagraph>하루 5분, 영어 일기 습관</Top.TitleParagraph>}
          subtitleTop={
            <Top.SubtitleParagraph>
              담당 AI 튜터와 함께 하루를 기록해보세요
            </Top.SubtitleParagraph>
          }
        />
      </header>

      <main>
        <section style={{ textAlign: 'center' }}>
          <Asset.Image
            frameShape={{ width: 220 }}
            src="/image.png"
            aria-hidden={true}
          />
        </section>

        <section style={{ marginTop: '18px' }}>
          <ListRow
            left={<ListRow.AssetIcon name="icon-pencil" />}
            contents={
              <ListRow.Texts
                type="2RowTypeA"
                top="AI 첨삭으로 문장 완성"
                bottom="문법·어휘·자연스러운 표현까지 즉시 피드백"
              />
            }
          />
          <ListRow
            left={<ListRow.AssetIcon name="icon-rocket" />}
            contents={
              <ListRow.Texts
                type="2RowTypeA"
                top="원문 ↔ 교정문 비교"
                bottom="수정 이유를 한국어로 설명해 이해를 도와줘요"
              />
            }
          />
          <ListRow
            left={<ListRow.AssetIcon name="icon-gift-red" />}
            contents={
              <ListRow.Texts
                type="2RowTypeA"
                top="배운 표현, 자동 복습"
                bottom="좋아요 한 문장은 단어장·퀴즈로 모아드려요"
              />
            }
          />
          <ListRow
            left={<ListRow.AssetIcon name="icon-fairy-face" />}
            contents={
              <ListRow.Texts
                type="2RowTypeA"
                top="프라이버시 우선"
                bottom="일기는 안전하게 보관되고 외부에 공개되지 않아요"
              />
            }
          />
        </section>
      </main>

      <footer>
        <FixedBottomCTA
          loading={loading}
          {...{ onClick: handleStart }}
          style={{ marginBottom: '8px' }}
        >
          오늘 일기 시작하기
        </FixedBottomCTA>

        {/* <FixedBottomCTA {...{ onClick: handleDevSkip }}>
          (DEV) 백엔드 없이 바로 쓰기
        </FixedBottomCTA> */}

        {/* <FixedBottomCTA 
          {...{ onClick: handleCheckLogin }}
        >
          저장된 JWT 확인
        </FixedBottomCTA>

        {jwt && (
          <FixedBottomCTA 
            {...{ onClick: handleLogout }}
          >
              로그아웃
          </FixedBottomCTA>
        )} */}
      </footer>
    </>
  )
}
