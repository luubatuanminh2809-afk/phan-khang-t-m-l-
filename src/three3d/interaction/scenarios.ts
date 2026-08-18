export interface DialogueChoice {
  id: "A" | "B" | "C";
  label: string;
  reactionLine: string;
  reactanceDelta: number;
}

export interface Scenario {
  speaker: string;
  initialLine: string;
  choices: DialogueChoice[];
}

// three short scripted beats, same negotiate/trade/refuse spread used across the rest
// of the game — one is picked at random each time the prototype scene is entered so
// replaying it doesn't always show the same teacher and the same line
export const SCENARIOS: Scenario[] = [
  {
    speaker: "Cô Lan",
    initialLine: "Điện thoại của em, đưa ngay cho cô. Không có bàn cãi gì cả.",
    choices: [
      { id: "A", label: "Dạ, em đưa cô ạ.", reactionLine: "Được, cuối buổi cô trả lại cho em.", reactanceDelta: 5 },
      { id: "B", label: "Cô cho em để chế độ rung, lỡ ba mẹ gọi ạ?", reactionLine: "Thôi được, cất ngay vào cặp cho cô.", reactanceDelta: 15 },
      { id: "C", label: "Sao cô cứ phải giữ điện thoại của em?", reactionLine: "Nộp ngay, hoặc cô mời phụ huynh lên gặp.", reactanceDelta: 35 },
    ],
  },
  {
    speaker: "Thầy Đức",
    initialLine: "Từ hôm nay em bắt buộc học thêm buổi chiều, không có ngoại lệ nào hết.",
    choices: [
      {
        id: "A",
        label: "Dạ, em sẽ sắp xếp đi học ạ.",
        reactionLine: "Tốt, thầy ghi tên em vào danh sách nhé.",
        reactanceDelta: 5,
      },
      {
        id: "B",
        label: "Thầy cho em học thử một buổi trước được không ạ?",
        reactionLine: "Được, nhưng buổi sau là phải đăng ký chính thức.",
        reactanceDelta: 15,
      },
      {
        id: "C",
        label: "Em đã học thêm chỗ khác rồi, sao thầy bắt buộc ạ?",
        reactionLine: "Không có lý do gì cả, thầy đã quyết định rồi.",
        reactanceDelta: 35,
      },
    ],
  },
  {
    speaker: "Cô Vân",
    initialLine: "Cả lớp lấy giấy ra, kiểm tra 15 phút đột xuất, không ai được hỏi bài.",
    choices: [
      {
        id: "A",
        label: "Dạ cô, em làm bài ngay ạ.",
        reactionLine: "Ngoan, cô tin em làm được.",
        reactanceDelta: 5,
      },
      {
        id: "B",
        label: "Cô ơi tụi em vừa thi xong hôm qua, cô cho tụi em thêm chút thời gian được không ạ?",
        reactionLine: "Thôi được, thêm 5 phút nữa thôi nhé.",
        reactanceDelta: 15,
      },
      {
        id: "C",
        label: "Kiểm tra kiểu này đâu có công bằng gì đâu cô!",
        reactionLine: "Không bàn cãi, làm bài ngay không cô trừ điểm.",
        reactanceDelta: 35,
      },
    ],
  },
];

export function pickRandomScenario(): Scenario {
  return SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
}
