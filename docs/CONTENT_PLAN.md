# Plan cho webgame Moralyn (PKTL)

> Đi kèm [`GAME_DESCRIPTION.md`](./GAME_DESCRIPTION.md). Ghi lại hiện trạng đối
> chiếu với docx gốc và các việc nên làm tiếp — chưa thực hiện, chỉ để tham
> khảo khi quyết định hướng đi tiếp theo.

## 1. Đối chiếu hiện trạng

Docx gốc mô tả **3 tình huống mẫu** (làm việc nhóm, cấm điện thoại, ngoại khóa
bắt buộc), theo góc nhìn Học sinh ↔ Giáo viên. Đối chiếu với code:

- Cả 3 đã được hiện thực **gần như nguyên văn** tại `st1`, `st2`, `st3` trong
  `src/data/situations.student.ts`.
- Ngoài 3 tình huống này, project đã có **60 tình huống tổng** (20 mỗi vai:
  student `st1`–`st20`, parent `pa1`–`pa20`, teacher `te1`–`te20`), tất cả đều
  theo đúng khung 4 mức A–D mô tả ở mục 3 của `GAME_DESCRIPTION.md`.
- Vậy: nội dung trong docx là **tập con** đã có sẵn trong game, không phải nội
  dung mới cần bổ sung.

## 2. Điểm lệch cần rà soát

- **`GDD.md`** (mục 7, bảng đối chiếu) vẫn ghi *"nếu làm cho cả 36 tình huống"*
  — số liệu này lỗi thời, thực tế đã có 60 tình huống. Nên cập nhật lại số
  liệu này khi có dịp sửa `GDD.md`.
- **`README.md`** vẫn là boilerplate mặc định của template Vite React+TS,
  chưa có mô tả gì về Moralyn/PKTL. Có thể thay bằng tổng quan ngắn (tên
  project, mục tiêu, cách chạy `npm run dev`) — hiện chưa làm vì nằm ngoài
  phạm vi yêu cầu ban đầu (tạo file context + plan).
- ~~Chưa có `CLAUDE.md` ở gốc project~~ — đã tạo, trỏ vào
  `docs/GAME_DESCRIPTION.md` và `docs/CONTENT_PLAN.md`.

## 3. Kịch bản chơi mới (docx cập nhật — `Mô tả Webgame (1).docx`) — ĐÃ HIỆN THỰC

Bản docx mới chỉ đổi phần "Kịch bản chơi" (xem `GAME_DESCRIPTION.md` mục 6),
3 tình huống mẫu và khung 4 mức A–D giữ nguyên. Đã triển khai, nhưng qua
nhiều vòng chỉnh theo phản hồi thực tế nên **lệch khỏi docx gốc ở vài điểm** —
xem đối chiếu chi tiết ở `GAME_DESCRIPTION.md` mục 6.1. Tóm tắt trạng thái
hiện tại (không phải docx gốc): vào vai → thẳng ngày 1 (không có hành lang mở
đầu — đã làm rồi bỏ) → mỗi tình huống mở góc nhìn thứ nhất, phản ứng tích cực
(A) đi tiếp mượt, phản ứng tiêu cực (B–D) chuyển ngay góc nhìn thứ 3 và hiện
luôn suy nghĩ thật của NPC → 3-4 tình huống/ngày (random, không cố định 3) →
minigame cuối ngày sinh 1 mã số → đủ 7 ngày × 7 mã số → mở rương → đánh giá
PKTL + lời khuyên.

### 3.1. Đã xây

- Góc nhìn thứ nhất → thứ 3 **có điều kiện**: `SituationScreen.tsx` mỗi tình
  huống mới luôn mở ở góc nhìn thứ nhất; `handlePick` chỉ chuyển sang thứ 3
  khi phương án chọn khác A, và màn sau phản hồi NPC hiện thẳng
  `situation.insideThought` (có tên NPC) thay vì câu lời-kết chung chung —
  người chơi thấy suy nghĩ thật ngay lập tức, không phải chờ cuối ngày.
- Mã số theo ngày + mở rương: `PlaySession.dailyCodes` (`src/types.ts`), sinh
  trong `FINISH_MINIGAME` (`src/state/gameContext.tsx`), hiện trong
  `RevealScreen.tsx`, tổng hợp ở màn hình mới `src/screens/ChestOpenScreen.tsx`
  (Screen union thêm `"chestOpen"`) — chạy sau ngày cuối, trước
  `EvaluationScreen`.
- `SITUATIONS_PER_DAY_MIN = 3`, `SITUATIONS_PER_DAY_MAX = 4`,
  `DAYS_PER_WEEK = 7` (`src/types.ts`) — mỗi ngày random 3 hoặc 4 tình huống
  (`pickWeekPlan` trong `src/data/content.ts`); mọi nơi hiển thị số ngày/tình
  huống (`DayIntroScreen`, `RoleSelectScreen`, `ExploreScreen`,
  `WeekProgress`...) đọc từ hằng số hoặc từ độ dài ngày thực tế, không hardcode.
- Bong bóng thoại: đổi từ thanh ngang RPG cố định dưới màn hình sang bong
  bóng nhỏ nổi phía trên đầu nhân vật (`SpeechBubble`/`NarrationBox` tái dùng
  từ `FreeRoamDemoScreen`, thêm chế độ `compact`), phân biệt rõ lời thoại
  (bong bóng trắng, có tên) và lời kể chuyện (khung tối, chữ nghiêng, không tên).
- Nhân vật trong tình huống phóng to đáng kể so với bản gốc (không còn "hiện
  diện nhỏ đứng trong cảnh" như thiết kế cũ), theo yêu cầu người chơi thử.

### 3.2. Đã bỏ: hành lang góc nhìn thứ nhất mở đầu

Từng xây `HallwayIntroScreen.tsx` (hành lang góc nhìn thứ nhất trước ngày 1,
tái dùng kỹ thuật `FreeRoamDemoScreen.tsx`) đúng theo docx, nhưng người chơi
thử thấy thừa nên đã **gỡ bỏ hoàn toàn** — `SELECT_ROLE` giờ vào thẳng
`dayIntro`. Đây là điểm lệch rõ nhất so với docx gốc (docx có mô tả bước
"bắt đầu hành trình lạc lõng ở 1 hành lang" trước tình huống đầu tiên).

### 3.3. Quyết định đã chốt: hướng (A) — đổi đúng 7×N theo docx

So với 2 hướng từng để ngỏ trước đó (A: đổi hằng số cho khớp docx, cần thêm
nội dung; B: giữ 3×5, chỉ thêm lớp trình bày) — đã chọn (A), sau đó chỉnh
tiếp 3 → 3-4 tình huống/ngày theo yêu cầu. Không cần viết thêm tình huống
mới: `pickWeekPlan` (`src/data/content.ts`) chọn ngẫu nhiên tình huống mỗi
ngày từ **toàn bộ 20 tình huống có sẵn** mỗi vai (không loại trừ giữa các
ngày), nên 7 ngày × 3-4 vẫn đủ nội dung — có thể trùng lại một tình huống ở
ngày khác trong cùng lượt chơi, chấp nhận được cho một lượt chơi.

## 4. Các hướng có thể làm tiếp (chọn khi cần, chưa thực hiện)

- **Viết thêm tình huống mới:** dùng mục 3–4 của `GAME_DESCRIPTION.md`
  (khung 4 mức A–D + cấu trúc field của `Situation`) làm chuẩn để giữ đúng
  văn phong/format khi thêm tình huống cho student/parent/teacher.
- **Cập nhật `GDD.md`:** sửa số liệu "36 tình huống" → 60, và có thể chèn một
  mục "Tổng quan game" ở đầu file (hiện `GDD.md` chỉ nói về tính năng mở rộng
  Free-Roam).
- **Viết `README.md` thật cho project.**

## 5. Trạng thái "Format game" (animation + giọng đọc) theo docx

- **Giọng đọc tiếng Việt:** đã có — `src/lib/speech.ts` dùng Web Speech API
  (`speechSynthesis`), tự chọn giọng `vi-VN` tốt nhất có trên máy, cho phép
  người chơi chọn giọng ưa thích qua settings (`getSettings().voiceURI`).
- **Hoạt hình nhân vật/biểu cảm:** có hệ thống minh họa tại
  `src/components/illustrations/` (`CharacterPortrait.tsx`,
  `SceneIllustration.tsx`, `GroupWorkScene.tsx`, `customScenes.tsx`) và CSS
  keyframe animation (theo `GDD.md` mục 6: `animate-char-bob`,
  `animate-char-react`).
- Kết luận: hai yêu cầu "Format game" trong docx (hoạt hình sinh động + giọng
  đọc chuẩn) đã có nền tảng kỹ thuật sẵn trong code — không phải xây từ đầu.
