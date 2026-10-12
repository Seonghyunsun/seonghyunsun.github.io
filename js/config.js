// 청첩장에 표시되는 모든 개인 정보. 샘플 값은 이곳에서 교체한다.
export const config = {
  groom: { name: "김민혁", father: "", mother: "이경아", phone: "010-5560-6353" },
  bride: { name: "성현선", father: "성락준", mother: "조미숙", phone: "010-5019-0356" },
  cover: "images/cover.jpg",
  weddingDate: "2027-01-03T12:40:00+09:00",
  venue: {
    name: "루이비스컨벤션 송파문정점",
    hall: "B1층",
    address: "서울특별시 송파구 법원로9길 26 H비즈니스파크 D동",
    tel: "02-0000-0000",
    transport: [
      ["지하철", "8호선·9호선 문정역 방면 (샘플: 실제 안내로 교체)"],
      ["주차", "건물 내 주차장 이용 (샘플: 실제 안내로 교체)"],
    ],
  },
  greeting: [
    "서로 다른 길을 걸어온 두 사람이",
    "이제 같은 길을 함께 걸어가려 합니다.",
    "귀한 걸음으로 자리를 빛내 주시면",
    "더없는 기쁨으로 간직하겠습니다.",
  ],
  gallery: ["images/1.svg", "images/2.svg", "images/3.svg", "images/4.svg", "images/5.svg", "images/6.svg"],
  accounts: {
    groom: [], // 신랑 계좌: { bank: "은행명", number: "계좌번호", holder: "김민혁" } 형식으로 추가
    bride: [{ bank: "카카오뱅크", number: "3333-29-5300712", holder: "성현선" }],
  },
  rsvpUrl: "",
};
