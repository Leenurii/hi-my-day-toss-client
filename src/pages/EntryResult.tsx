// src/pages/EntryResult.tsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Top, ListRow, Asset } from '@toss/tds-mobile'
import { apiFetch } from '@/libs/api'
import PageSkeleton from '@/components/PageSkeleton'

type Analysis = {
  translation?: { to: 'en' | 'ko'; text: string }
  corrections?: { corrected?: string; explanations?: string[] }
  vocab_suggestions?: { word: string; meaning_ko?: string; example_en?: string }[]
  model?: string
}

export default function EntryResult() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    id: number
    original_lang: 'en' | 'ko'
    original_text: string
    analysis?: Analysis
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        setError(null)
        setLoading(true)
        const detail = await apiFetch(`/api/entries/${id}/`)
        setData(detail)
      } catch (e: any) {
        setError(e?.message ?? '데이터를 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) {
    return (
      <>
        <Top
          upperGap={0}
          title={<Top.TitleParagraph>분석 결과</Top.TitleParagraph>}
          subtitleTop={<Top.SubtitleParagraph>원문 ↔ 교정문 비교, 단어 추천</Top.SubtitleParagraph>}
        />
        <main style={{ padding: 16 }}>
          {/* ✅ 스켈레톤 적용 */}
          <PageSkeleton variant="entryResult" />
        </main>
      </>
    )
  }

  if (error) {
    return (
      <main style={{ padding: 16 }}>
        <p style={{ marginBottom: 12 }}>오류: {error}</p>
        <button
          onClick={() => location.reload()}
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            border: '1px solid #E5E7EB',
            background: '#F9FAFB',
          }}
        >
          다시 시도
        </button>
      </main>
    )
  }

  if (!data) {
    return <div style={{ padding: 16 }}>데이터가 없어요.</div>
  }

  return (
    <>
      <Top
        upperGap={0}
        title={<Top.TitleParagraph>분석 결과</Top.TitleParagraph>}
        subtitleTop={<Top.SubtitleParagraph>원문 ↔ 교정문 비교, 단어 추천</Top.SubtitleParagraph>}
      />

      <main style={{ padding: 16 }}>
        <section style={{ marginBottom: 16 }}>
          <h3 style={{ margin: '8px 0' }}>원문</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{data.original_text}</p>
        </section>

        {data.analysis?.translation?.text && (
          <section style={{ marginBottom: 16 }}>
            <ListRow
              left={<ListRow.AssetIcon name="icon-translate" />}
              contents={<ListRow.Texts type="2RowTypeA" top="번역" bottom={data.analysis.translation.text} />}
            />
          </section>
        )}

        {data.analysis?.corrections?.corrected && (
          <section style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '8px 0' }}>교정문</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{data.analysis.corrections.corrected}</p>
            {!!data.analysis.corrections.explanations?.length && (
              <>
                <h4 style={{ margin: '8px 0' }}>수정 이유</h4>
                <ul style={{ paddingLeft: 18 }}>
                  {data.analysis.corrections.explanations.map((v, i) => <li key={i}>{v}</li>)}
                </ul>
              </>
            )}
          </section>
        )}

        {!!data.analysis?.vocab_suggestions?.length && (
          <section style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '8px 0' }}>암기 추천</h3>
            <ul style={{ paddingLeft: 18 }}>
              {data.analysis.vocab_suggestions.map((v, i) => (
                <li key={i}>
                  <strong>{v.word}</strong>
                  {v.meaning_ko ? ` — ${v.meaning_ko}` : ''}{v.example_en ? ` / ${v.example_en}` : ''}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section style={{ textAlign: 'center', marginTop: 16 }}>
          <Asset.Image frameShape={{ width: 160 }} src="https://static.toss.im/3d-common/app-in-toss-spot.png" aria-hidden />
        </section>
      </main>
    </>
  )
}
