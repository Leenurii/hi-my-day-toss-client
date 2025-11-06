import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Top } from '@toss/tds-mobile'
import { apiFetch } from '@/libs/api'
import PageSkeleton from '@/components/PageSkeleton'

type Analysis = {
  translation?: { to: 'en' | 'ko'; text: string }
  corrections?: { corrected?: string; explanations?: string[] }
  vocab_suggestions?: { word: string; meaning_ko?: string; example_en?: string }[]
  score?: {
    value: number
    comment_ko: string
    focus_next_time?: string
  }
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

  type EntryDetail = {
    id: number
    original_lang: 'en' | 'ko'
    original_text: string
    analysis?: Analysis
  }

  useEffect(() => {
    ;(async () => {
      try {
        setError(null)
        setLoading(true)
        const detail = await apiFetch<EntryDetail>(`/api/entries/${id}/`)
        setData(detail)
      } catch (e: any) {
        setError(e?.message ?? '데이터를 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  // 화면에서 언어별 텍스트 다르게 보여주기 위해 미리 계산
  const isOriginalEnglish = data?.original_lang === 'en'
  const translationLabelTop = isOriginalEnglish
    ? '의미 체크 (한국어)'
    : '자연스러운 영어 번역'
  const translationSubText = isOriginalEnglish
    ? '한국어로 이런 느낌이에요.'
    : '자연스러운 영어 문장.'
  

  // 공통 스타일 (useMemo로 한번만 만들어서 재사용)
  const styles = useMemo(() => {
    const cardShadow = '0 8px 24px rgba(0,0,0,0.04)'
    const borderColor = 'rgba(0,0,0,0.06)'
    const textSecondary = '#6B7280' // 중간 그레이
    const textPrimary = '#111827'   // 거의 블랙
    const surface = '#FFFFFF'
    const surfaceAlt = '#F9FAFB'    // 살짝 톤다운된 영역 배경

    return {
      page: {
        backgroundColor: '#F5F6F8', // 화면 전체 뒷배경
        minHeight: '100vh',
      },
      main: {
        padding: 16,
        paddingBottom: 24,
        maxWidth: 480,
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box' as const,
      },

      sectionCard: {
        backgroundColor: surface,
        borderRadius: 16,
        boxShadow: cardShadow,
        border: `1px solid ${borderColor}`,
        padding: '16px 20px',
        marginBottom: 16,
      },

      labelRow: {
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: 12,
        flexWrap: 'wrap' as const,
        rowGap: '8px',
      },
      labelText: {
        fontSize: 13,
        fontWeight: 600,
        color: textPrimary,
        lineHeight: 1.4,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      },
      subLabelText: {
        fontSize: 12,
        fontWeight: 400,
        color: textSecondary,
        lineHeight: 1.4,
        textAlign: 'right' as const,
        maxWidth: '60%',
      },

      bubbleBox: {
        backgroundColor: surfaceAlt,
        borderRadius: 12,
        border: `1px solid ${borderColor}`,
        padding: '12px 14px',
        fontSize: 14,
        lineHeight: 1.5,
        color: textPrimary,
        whiteSpace: 'pre-wrap' as const,
        wordBreak: 'break-word' as const,
      },

      translationRowWrapper: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 8,
      },
      translationRow: {
        borderRadius: 12,
        border: `1px solid ${borderColor}`,
        backgroundColor: '#FFFFFF',
        boxShadow: cardShadow,
      },

      correctionReasonsWrapper: {
        marginTop: 16,
        paddingTop: 12,
        borderTop: `1px solid ${borderColor}`,
      },
      correctionReasonsTitle: {
        fontSize: 13,
        fontWeight: 600,
        color: textPrimary,
        marginBottom: 8,
      },
      correctionReasonsList: {
        paddingLeft: 16,
        margin: 0,
        color: textPrimary,
        fontSize: 13,
        lineHeight: 1.5,
      },

      vocabHeaderRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        flexWrap: 'wrap' as const,
        rowGap: '8px',
      },
      vocabHeaderLeft: {
        fontSize: 13,
        fontWeight: 600,
        color: textPrimary,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      },
      vocabHint: {
        fontSize: 11,
        fontWeight: 400,
        color: textSecondary,
        lineHeight: 1.4,
        textAlign: 'right' as const,
        maxWidth: '60%',
      },

      vocabListWrapper: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 10,
      },
      vocabItemCard: {
        backgroundColor: surfaceAlt,
        borderRadius: 12,
        border: `1px solid ${borderColor}`,
        padding: '12px 14px',
      },
      vocabWordRow: {
        display: 'flex',
        alignItems: 'baseline',
        flexWrap: 'wrap' as const,
        rowGap: 4,
        columnGap: 8,
        marginBottom: 6,
      },
      vocabWord: {
        fontSize: 14,
        fontWeight: 600,
        color: textPrimary,
      },
      vocabMeaning: {
        fontSize: 13,
        fontWeight: 400,
        color: textSecondary,
      },
      vocabExample: {
        fontSize: 13,
        color: textPrimary,
        lineHeight: 1.5,
      },

      scoreHeaderRow: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap' as const,
        rowGap: '8px',
        marginBottom: 12,
      },
      scoreLeftGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
      },
      scoreBadge: {
        display: 'inline-block',
        backgroundColor: '#DBEAFE',
        color: '#1E3A8A',
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1.2,
        padding: '3px 6px',
        borderRadius: 6,
      },
      scoreTitleText: {
        fontSize: 13,
        fontWeight: 600,
        color: textPrimary,
        lineHeight: 1.4,
      },
      scoreValueWrap: {
        textAlign: 'right' as const,
      },
      scoreValueText: {
        fontSize: 20,
        fontWeight: 600,
        color: textPrimary,
        lineHeight: 1,
      },
      scoreOutOf: {
        fontSize: 12,
        marginLeft: 2,
        color: textSecondary,
        fontWeight: 400,
      },
      scoreCommentWrap: {
        marginTop: 12,
      },
      scoreCommentMain: {
        fontSize: 14,
        lineHeight: 1.5,
        color: textPrimary,
        marginBottom: 8,
        whiteSpace: 'pre-wrap' as const,
        wordBreak: 'break-word' as const,
      },
      scoreNextTip: {
        fontSize: 12,
        lineHeight: 1.4,
        color: textSecondary,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        border: '1px solid rgba(0,0,0,0.05)',
        padding: '8px 10px',
        whiteSpace: 'pre-wrap' as const,
        wordBreak: 'break-word' as const,
      },

      errorWrapper: {
        padding: 16,
      },
      retryBtn: {
        padding: '10px 14px',
        borderRadius: 10,
        border: '1px solid #E5E7EB',
        background: '#F9FAFB',
      },
      emptyWrapper: {
        padding: 16,
        fontSize: 14,
        color: textSecondary,
      },
      translationTopLabel: {
        fontSize: 12,
        fontWeight: 600,
        color: '#6B7280', // textSecondary 톤
        lineHeight: 1.4,
        marginBottom: 6,
      },
      translationTextBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: `1px solid rgba(0,0,0,0.06)`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
        padding: '12px 14px',
        fontSize: 14,
        lineHeight: 1.5,
        color: '#111827',
        whiteSpace: 'pre-wrap' as const,
        wordBreak: 'break-word' as const,
      },

    }
  }, [data?.original_lang])

  // 로딩 상태
  if (loading) {
    return (
      <>
        <Top
          upperGap={0}
          title={<Top.TitleParagraph>분석 결과</Top.TitleParagraph>}
          subtitleTop={<Top.SubtitleParagraph>원문 ↔ 교정문 비교, 단어 추천</Top.SubtitleParagraph>}
        />
        <main style={styles.main}>
          <PageSkeleton variant="entryResult" />
        </main>
      </>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <main style={styles.errorWrapper}>
        <p style={{ marginBottom: 12 }}>오류: {error}</p>
        <button
          onClick={() => location.reload()}
          style={styles.retryBtn}
        >
          다시 시도
        </button>
      </main>
    )
  }

  // 데이터 없음
  if (!data) {
    return <div style={styles.emptyWrapper}>데이터가 없어요.</div>
  }

  return (
    <div style={styles.page}>
      <Top
        upperGap={0}
        title={<Top.TitleParagraph>분석 결과</Top.TitleParagraph>}
        subtitleTop={<Top.SubtitleParagraph>원문 ↔ 교정문 비교, 단어 추천</Top.SubtitleParagraph>}
      />

      <main style={styles.main}>

        {/* 오늘의 점수 */}
        {data.analysis?.score && (
          <section style={styles.sectionCard}>
            <div style={styles.scoreHeaderRow}>
              <div style={styles.scoreLeftGroup}>
                <span style={styles.scoreBadge}>TODAY SCORE</span>
                <span style={styles.scoreTitleText}>오늘의 영어일기 점수</span>
              </div>

              <div style={styles.scoreValueWrap}>
                <span style={styles.scoreValueText}>
                  {data.analysis.score.value}
                </span>
                <span style={styles.scoreOutOf}>/100</span>
              </div>
            </div>

            <div style={styles.scoreCommentWrap}>
              <div style={styles.scoreCommentMain}>
                {data.analysis.score.comment_ko}
              </div>

              {data.analysis.score.focus_next_time && (
                <div style={styles.scoreNextTip}>
                  다음에 이것만 더 챙겨보면 좋아요: {data.analysis.score.focus_next_time}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 원문 */}
        <section style={styles.sectionCard}>
          <div style={styles.labelRow}>
            <div style={styles.labelText}>
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: '#EEF2FF',
                  color: '#4F46E5',
                  fontSize: 11,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  padding: '3px 6px',
                  borderRadius: 6,
                }}
              >
                ORIGINAL
              </span>
              <span>내가 쓴 문장</span>
            </div>

            <div style={styles.subLabelText}>
              그대로 저장돼요. AI는 참고용이에요.
            </div>
          </div>

          <div style={styles.bubbleBox}>
            {data.original_text}
          </div>
        </section>

        {/* 번역 / 의미 */}
        {data.analysis?.translation?.text && (
          <section style={styles.sectionCard}>
            <div style={styles.labelRow}>
              <div style={styles.labelText}>
                <span
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#ECFDF5',
                    color: '#047857',
                    fontSize: 11,
                    fontWeight: 600,
                    lineHeight: 1.2,
                    padding: '3px 6px',
                    borderRadius: 6,
                  }}
                >
                  TRANSLATION
                </span>
                <span>{translationLabelTop}</span>
              </div>

              <div style={styles.subLabelText}>
                {translationSubText}
              </div>
            </div>

            <div style={styles.translationRowWrapper}>

              <div style={styles.translationTextBox}>
                {data.analysis.translation.text}
              </div>
            </div>
          </section>
        )}

        {/* 교정문 / 수정 이유 */}
        {data.analysis?.corrections?.corrected && (
          <section style={styles.sectionCard}>
            <div style={styles.labelRow}>
              <div style={styles.labelText}>
                <span
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#FFF7ED',
                    color: '#C2410C',
                    fontSize: 11,
                    fontWeight: 600,
                    lineHeight: 1.2,
                    padding: '3px 6px',
                    borderRadius: 6,
                  }}
                >
                  CORRECTED
                </span>
                <span>더 자연스러운 표현</span>
              </div>

              <div style={styles.subLabelText}>
                원어민은 이렇게 써요.
              </div>
            </div>

            <div style={styles.bubbleBox}>
              {data.analysis.corrections.corrected}
            </div>

            {!!data.analysis.corrections.explanations?.length && (
              <div style={styles.correctionReasonsWrapper}>
                <div style={styles.correctionReasonsTitle}>왜 이렇게 바꿨어요?</div>
                <ul style={styles.correctionReasonsList}>
                  {data.analysis.corrections.explanations.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* 표현 확장 추천 */}
        {!!data.analysis?.vocab_suggestions?.length && (
          <section style={styles.sectionCard}>
            <div style={styles.vocabHeaderRow}>
              <div style={styles.vocabHeaderLeft}>
                <span
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    fontSize: 11,
                    fontWeight: 600,
                    lineHeight: 1.2,
                    padding: '3px 6px',
                    borderRadius: 6,
                  }}
                >
                  VOCAB
                </span>
                <span>표현 확장</span>
              </div>

              <div style={styles.vocabHint}>
                다음 일기에 한 번 써봐요.
              </div>
            </div>

            <div style={styles.vocabListWrapper}>
              {data.analysis.vocab_suggestions.map((v, i) => (
                <div key={i} style={styles.vocabItemCard}>
                  <div style={styles.vocabWordRow}>
                    <span style={styles.vocabWord}>{v.word}</span>
                    {v.meaning_ko && (
                      <span style={styles.vocabMeaning}>{v.meaning_ko}</span>
                    )}
                  </div>

                  {v.example_en && (
                    <div style={styles.vocabExample}>
                      {v.example_en}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 모델 정보 같은 메타 (optional) */}
        {data.analysis?.model && (
          <section style={{ textAlign: 'center', marginTop: 24, marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>
              AI 분석 모델: {data.analysis.model}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
