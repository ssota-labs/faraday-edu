// Chapter 8 — 모의고사 (exam pack)
// Blueprint: 측정(1) · 운동학(2) · 역학(2) · 에너지(1) · 파동(1) = 7 items
// Original situations only — no verbatim CSAT items.
import { useState } from "react";
import {
  Lesson,
  Prose,
  SlideDeck,
  Quiz,
  NumericAnswer,
  Reveal,
  Callout,
  TeX,
} from "@faraday-academy/kit/blocks";
import { Button } from "@faraday-academy/ui/components/ui/button";

const G = 9.8;

// Precomputed answers (spot-checked)
const A_CONVERT = 2500; // 2.5 km → m
const A_X = 2 * 3 + 0.5 * 1 * 9; // v0=2, a=1, t=3 → 6+4.5=10.5
const A_RANGE = (10 * 10 * Math.sin(Math.PI / 2)) / G; // v=10, θ=45 → 100/9.8
const A_ACCEL = (15 - 3) / 4; // F=15, f=3, m=4 → 3
const A_CENT = (5 * 5) / 2.5; // 10
const A_SPEED = Math.sqrt(2 * G * 3); // √58.8 ≈ 7.67
const A_WAVE = 340 / 170; // λ = v/f = 2

export default function MockExamChapter() {
  const [scores, setScores] = useState<Record<string, boolean>>({});

  const mark = (id: string) => (correct: boolean) =>
    setScores((s) => ({ ...s, [id]: correct }));

  const ids = ["u", "x", "r", "a", "c", "e", "w", "concept"];
  const correctCount = ids.filter((id) => scores[id]).length;
  const attempted = ids.filter((id) => id in scores).length;

  return (
    <Lesson
      topic="시험장의 물리 · 모의"
      title="짧은 모의고사"
      lead="앞 챕터를 한 번에 점검한다. 기출 문장 복사가 아니라, 시험장 상황으로 다시 쓴 문항이다."
    >
      <Prose>
        <p>
          <strong>구성:</strong> 8문항 · 측정 1 · 운동학 2 · 역학(뉴턴·원) 2 · 에너지 1 ·
          파동 1 · 개념 1. 제한 시간은 느슨히 15분. 끝까지 가면 복습 요약을 볼 수 있다.
        </p>
        <p>
          계산은 <TeX>{String.raw`g=9.8\,\mathrm{m/s^2}`}</TeX>를 쓴다. 답은 앞에서
          조작한 모델과 같은 관계를 묻는다.
        </p>
      </Prose>

      <Callout title="진행 현황">
          채점된 문항 {attempted}/8 · 맞은 문항 {correctCount}/8
        {attempted > 0 ? (
          <span className="ml-2 text-muted-foreground">
            ({Math.round((correctCount / Math.max(attempted, 1)) * 100)}%)
          </span>
        ) : null}
      </Callout>

      <SlideDeck
        inkKey="exam-hall-mock"
        slides={[
          {
            id: "intro",
            title: "시작",
            content: (
              <Prose>
                <p>
                  화살표 키 또는 하단 버튼으로 문항을 넘긴다. 각 문항에서 Check를
                  눌러야 채점된다. 마지막 슬라이드에서 영역별 복습 포인트를 확인하라.
                </p>
              </Prose>
            ),
          },
          {
            id: "u",
            title: "측정",
            content: (
              <NumericAnswer
                question="고사장까지 안내 표지: 2.5 km. 미터로 환산하면?"
                answer={A_CONVERT}
                unit="m"
                tolerance={1}
                hint="1 km = 1000 m."
                onChecked={mark("u")}
              />
            ),
          },
          {
            id: "x",
            title: "등가속도",
            content: (
              <NumericAnswer
                question="복도에서 v₀=2 m/s, a=1 m/s²로 3초 동안 달렸다. 변위 x (m)는? (x₀=0)"
                answer={A_X}
                unit="m"
                tolerance={0.1}
                hint="x = v₀t + ½at²."
                onChecked={mark("x")}
              />
            ),
          },
          {
            id: "r",
            title: "포물선",
            content: (
              <NumericAnswer
                question="속력 10 m/s, 각도 45°로 던진 이상적 사거리 R (m)는?"
                answer={A_RANGE}
                unit="m"
                tolerance={0.2}
                hint="R = v²/g (θ=45°)."
                onChecked={mark("r")}
              />
            ),
          },
          {
            id: "a",
            title: "뉴턴",
            content: (
              <NumericAnswer
                question="질량 4 kg 물체에 F=15 N, 마찰 3 N. 가속도 a (m/s²)는?"
                answer={A_ACCEL}
                unit="m/s²"
                tolerance={0.05}
                hint="a = (F−f)/m."
                onChecked={mark("a")}
              />
            ),
          },
          {
            id: "c",
            title: "원운동",
            content: (
              <NumericAnswer
                question="속력 5 m/s, 반지름 2.5 m 등속 원. 구심가속도 (m/s²)는?"
                answer={A_CENT}
                unit="m/s²"
                tolerance={0.1}
                hint="a = v²/r."
                onChecked={mark("c")}
              />
            ),
          },
          {
            id: "e",
            title: "에너지",
            content: (
              <NumericAnswer
                question="높이 3 m에서 정지 출발, 마찰 없음. 바닥 속력 (m/s)는?"
                answer={A_SPEED}
                unit="m/s"
                tolerance={0.15}
                hint="v = √(2gh)."
                onChecked={mark("e")}
              />
            ),
          },
          {
            id: "w",
            title: "파동",
            content: (
              <NumericAnswer
                question="공기 중 소리 v=340 m/s, f=170 Hz. 파장 λ (m)는?"
                answer={A_WAVE}
                unit="m"
                tolerance={0.05}
                hint="λ = v/f."
                onChecked={mark("w")}
              />
            ),
          },
          {
            id: "concept",
            title: "개념 한 방",
            content: (
              <Quiz
                question="최고점에서 비스듬히 던진 물체의 속도는?"
                options={[
                  {
                    label: "0이다",
                    hint: "연직 성분만 0 — 수평 성분은 남는다.",
                  },
                  {
                    label: "수평 성분만 남는다",
                    correct: true,
                    hint: "v_x = v cosθ.",
                  },
                  {
                    label: "연직 성분만 남는다",
                    hint: "최고점에서 v_y=0.",
                  },
                  {
                    label: "속력이 최대",
                    hint: "오히려 속력은 최소에 가깝다.",
                  },
                ]}
                onChecked={mark("concept")}
              />
            ),
          },
          {
            id: "review",
            title: "복습",
            content: (
              <Reveal label="제출 후 복습 열기">
                <Prose>
                  <p>
                    <strong>영역별 되돌아가기</strong>
                  </p>
                  <ul>
                    <li>측정·환산 → 1장 (접두어·차원)</li>
                    <li>등가속도·포물선 → 2–3장 (이차식·성분 분해)</li>
                    <li>뉴턴·원 → 4–5장 (ΣF=ma, v²/r)</li>
                    <li>에너지 → 6장 (√(2gh))</li>
                    <li>파동 → 7장 (v=fλ)</li>
                  </ul>
                  <p>
                    목표: 채점한 문항 중 80% 이상. 틀린 영역 챕터로 돌아가 Explore
                    시뮬을 다시 돌린 뒤 재도전하라.
                  </p>
                </Prose>
              </Reveal>
            ),
          },
        ]}
      />

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setScores({})}>
          채점 초기화
        </Button>
      </div>
    </Lesson>
  );
}
