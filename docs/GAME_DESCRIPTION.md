# Moralyn (PKTL) — Mô tả Webgame

> Nguồn gốc: chuyển thể có cấu trúc từ `Mô tả Webgame.docx` (đối chiếu khớp với
> nội dung đã hiện thực trong `src/data/situations.student.ts`, `st1`–`st3`).
> Mục 6 (Kịch bản chơi) đã được cập nhật theo `Mô tả Webgame (1).docx` —
> bản mô tả mới hơn, chỉ thay đổi phần kịch bản chơi, giữ nguyên 3 tình huống
> mẫu và khung 4 mức A–D ở các mục dưới.
> Dùng file này làm **context chính** khi viết/rà soát nội dung tình huống.

## 1. Tổng quan

- **Thể loại:** Webgame hoạt hình mô phỏng tình huống (situation simulation).
- **Mục tiêu:** Đưa người chơi qua các tình huống bị áp đặt quy định trong đời
  sống học đường/gia đình, quan sát cách người chơi phản ứng để **đánh giá mức
  độ phản kháng tâm lý (PKTL)** của họ, từ đó đưa ra lời khuyên phù hợp.
- **Nền tảng kỹ thuật:** Web app thuần (React 19 + TypeScript + Vite), không
  backend, mobile-first.

## 2. Nhân vật

- **Học sinh** — nhân vật trung tâm, người chơi thường đóng vai này.
- **Phụ huynh**
- **Giáo viên**

Docx gốc chỉ mô tả các tình huống theo góc nhìn **Học sinh ↔ Giáo viên** (học
sinh phản ứng, giáo viên đáp lại). Trong code hiện tại, cả 3 vai đều chơi được
(`Role = "student" | "parent" | "teacher"`, xem `src/types.ts`) — người chơi có
thể chọn đóng vai Phụ huynh hoặc Giáo viên và đối diện với tình huống từ góc
nhìn ngược lại.

## 3. Khung 4 mức độ phản kháng tâm lý (A–D)

Mỗi tình huống luôn có đúng 4 lựa chọn phản ứng, tương ứng 4 mức độ leo thang:

| Mức | Tên | Tinh thần chung |
|---|---|---|
| **A** | Thương lượng & Thỏa thuận | Chủ động đề xuất, xin phép, đưa ra cam kết đổi lại — vẫn tôn trọng người có thẩm quyền. |
| **B** | Phản ứng mềm (Lách luật) | Không nói ra, âm thầm làm khác đi hoặc đối phó hình thức — tránh xung đột trực tiếp nhưng không thật sự tuân thủ. |
| **C** | Phản ứng cứng (Chống đối công khai) | Phản đối/tranh cãi trực tiếp, công khai trước mặt người có thẩm quyền hoặc trước tập thể. |
| **D** | Bất hợp tác hoàn toàn | Mặc kệ hậu quả, từ chối tuân thủ dù bị phạt, không thương lượng. |

Khớp với `STYLE_META` (`src/types.ts`): A=`handshake`, B=`mask`, C=`megaphone`,
D=`hand`.

## 4. Cấu trúc một tình huống

Mỗi tình huống là một object theo interface `Situation` (`src/types.ts`):

- `context` — bối cảnh: `"school"` hoặc `"home"`.
- `time`, `location` — thời điểm và nơi diễn ra.
- `npcName`, `npcRole` — nhân vật đối diện (VD: "Cô Hạnh" — Giáo viên phụ trách dự án nhóm).
- `dialogue` — lời/quy định NPC đưa ra, mở đầu tình huống.
- `options` (4 phần tử, id `A`–`D`) — mỗi lựa chọn gồm:
  - `label` — lời nói và/hoặc hành động cụ thể của học sinh (hai yếu tố này
    được gộp vào một `label`; nếu chỉ có hành động không lời, `label` mô tả
    hành động).
  - `sublabel` — tên mức độ (VD: "Thương lượng & thỏa thuận").
  - `reaction` — phản ứng cụ thể của NPC đối diện đối với lựa chọn đó.
- `insideThought` + `insideThoughtOwner` — "suy nghĩ thật" của NPC, tiết lộ sau
  khi người chơi đã chọn (why họ đặt ra quy định này, không phải vì ác ý).

## 5. Ba tình huống mẫu (từ docx gốc)

Ba tình huống dưới đây là bản mô tả gốc trong docx — đã hiện thực trong
`src/data/situations.student.ts` tại `st1`, `st2`, `st3`.

### Tình huống 1: Bắt buộc làm việc nhóm theo danh sách chỉ định (`st1`)

- **Mức A:** "Cô ơi, nhóm em xin làm đề tài này được không, bù lại tụi em sẽ
  cam kết đạt kết quả cao hơn?" → Giáo viên cân nhắc, có thể đồng ý nếu lý do
  hợp lý và có cam kết rõ ràng, hoặc yêu cầu trình bày kế hoạch trước.
- **Mức B:** Chấp nhận nhóm mới nhưng ngầm nhờ nhóm bạn thân làm hộ, hoặc tự
  bẻ lái nội dung đề tài theo ý mình → Giáo viên khó phát hiện; nếu phát hiện
  sẽ nhắc nhở hoặc yêu cầu làm lại từ đầu.
- **Mức C:** Bức xúc nói giữa lớp, tranh cãi trực tiếp đòi quyền tự chọn nhóm
  và đề tài → Giáo viên bực mình vì bị thách thức trước lớp, có thể phạt cảnh
  cáo, mời lên phòng hội đồng hoặc giữ nguyên quyết định để khẳng định uy quyền.
- **Mức D:** Bỏ mặc hoàn toàn, không tham gia họp nhóm, thà nhận điểm kém chứ
  không chịu áp đặt → Giáo viên cho điểm 0 phần làm việc nhóm, ghi sổ đầu bài,
  mời phụ huynh hoặc hạ hạnh kiểm; các bạn trong nhóm cũng bị ảnh hưởng.

### Tình huống 2: Cấm tuyệt đối sử dụng điện thoại trong giờ học (`st2`)

- **Mức A:** "Thầy/Cô ơi, cho tụi em giữ điện thoại nhưng úp mặt xuống bàn,
  chỉ dùng khi cần tra cứu tài liệu học tập được không ạ?" → Thầy/Cô có thể
  đồng ý nếu lớp cam kết kỷ luật, hoặc yêu cầu nộp hẳn nhưng không phạt nặng.
- **Mức B:** Nộp một điện thoại hỏng/cũ vào tủ khóa, còn điện thoại thật giấu
  trong cặp để lén dùng → Khó phát hiện; nếu bắt được sẽ tịch thu điện thoại
  thật và xử phạt nặng hơn vì hành vi lừa dối.
- **Mức C:** Nói to bất bình "Thời đại này học tập phải dùng mạng chứ!" và cố
  tình mở điện thoại công khai để thách thức → Thầy/Cô tức giận, tịch thu
  điện thoại ngay tại lớp, ghi sổ đầu bài và báo lên Ban Giám hiệu.
- **Mức D:** Quyết không nộp điện thoại, chấp nhận chịu phạt, viết bản kiểm
  điểm hay mời phụ huynh chứ không giao nộp → Thầy/Cô mời phụ huynh lên làm
  việc, đề nghị hạ hạnh kiểm hoặc xử lý kỷ luật theo quy định nhà trường.

### Tình huống 3: Bắt buộc tham gia phong trào/hoạt động ngoại khóa (`st3`)

- **Mức A:** "Thầy/Cô cho em đăng ký làm ban hậu cần thay vì chạy được không
  ạ? Em xin cam kết hỗ trợ nhiệt tình." → Thầy/Cô thấy hợp lý vì vẫn có người
  tham gia, có thể đồng ý hoặc đề nghị thuyết phục thêm vài bạn làm cùng.
- **Mức B:** Đăng ký tên trên danh sách, đến điểm danh đầu giờ xong lén trốn
  về, hoặc xin giấy khám sức khỏe giả để lấy lý do nghỉ → Thầy/Cô phát hiện
  khi điểm danh cuối buổi thấy vắng, yêu cầu giải trình và phạt bù hoặc trừ
  điểm thi đua.
- **Mức C:** Phát biểu tranh cãi "Chủ Nhật là thời gian nghỉ ngơi cá nhân,
  trường không có quyền ép học sinh đi làm việc ngoài giờ!" → Thầy/Cô giải
  thích đây là hoạt động chung của trường, nếu không tham gia sẽ bị trừ điểm
  hạnh kiểm, đồng thời nhắc nhở thái độ của học sinh.
- **Mức D:** Mặc kệ dọa trừ điểm thi đua hay hạnh kiểm, tắt máy ở nhà, quyết
  không xuất hiện → Thầy/Cô ghi nhận vắng mặt không phép, hạ hạnh kiểm và mời
  phụ huynh làm việc.

## 6. Kịch bản chơi (Gameplay flow)

> Cập nhật theo phản hồi thực tế khi chơi thử — khác vài điểm so với
> `Mô tả Webgame (1).docx` gốc, xem đối chiếu ở mục 6.1.

1. Người chơi chọn vai → vào thẳng ngày 1 (không có màn hành lang mở đầu —
   từng thử nhưng người chơi thấy thừa, đã bỏ).
2. Vào một **tình huống**: mở ở góc nhìn thứ nhất (first-person), game đưa ra
   bối cảnh, NPC đối diện, quy định/lời NPC nói ra.
3. Game hiển thị 4 lựa chọn (keywords/câu nói + hành động) ứng với 4 mức phản
   kháng A–D. Người chơi bấm chọn **một** lựa chọn để thể hiện cách mình
   thường ứng xử.
4. Sau khi chọn:
   - **Mức A (thương lượng, tích cực):** giữ nguyên góc nhìn thứ nhất, xem
     phản hồi NPC rồi đi tiếp mượt mà.
   - **Mức B–D (tiêu cực):** **chuyển ngay sang góc nhìn thứ 3** — xem phản
     hồi NPC, rồi hiện luôn **suy nghĩ thật** (`insideThought`) của họ, có ghi
     tên — để người chơi thấy rõ tâm lý thật đằng sau phản ứng, không phải
     chờ đến cuối ngày.
5. Lặp lại bước 2–4 cho đủ số tình huống hôm nay (**3–4 tình huống/ngày**,
   random mỗi ngày).
6. Cuối mỗi ngày, người chơi chơi 1 **minigame** để nhận **1 mã số ngẫu
   nhiên** (dùng cho bước mở rương).
7. Sau khi hoàn thành đủ **7 ngày**, người chơi có đủ **7 mã số** để **mở
   rương**.
8. Mở rương xong, game hiện **bảng đánh giá mức độ PKTL** (tổng hợp từ các
   lựa chọn A–D đã chọn suốt 7 ngày) kèm **lời khuyên** phù hợp cho học sinh.

### 6.1. Đối chiếu với code hiện tại

- **Hành lang góc nhìn thứ nhất mở đầu:** đã từng làm (`HallwayIntroScreen.tsx`,
  tái dùng kỹ thuật của `FreeRoamDemoScreen.tsx`) rồi **bỏ theo yêu cầu** —
  vào vai xong là vào thẳng `dayIntro`. `FreeRoamDemoScreen.tsx` (demo kỹ
  thuật free-roam, xem `GDD.md`) vẫn còn, không liên quan đến luồng chính.
- Bước 3–4 (4 lựa chọn A–D → phản hồi NPC → suy nghĩ thật, chuyển góc nhìn có
  điều kiện): `SituationScreen.tsx` — mỗi tình huống mới luôn mở ở góc nhìn
  thứ nhất (mặc định `viewMode: "first"`); `handlePick` chỉ gọi
  `setViewMode("third")` khi `style !== "A"`, và khi đó màn hình sau phản hồi
  NPC hiện thẳng `situation.insideThought` (thay vì câu lời-kết chung chung)
  — chỉ đổi cục bộ trong phiên hiển thị, không ghi đè lựa chọn góc nhìn đã lưu
  của người chơi. `RevealScreen.tsx` (cuối ngày) vẫn hiện lại `insideThought`
  cho **mọi** tình huống trong ngày, kể cả các lượt chọn A.
- Bước 5 (3-4 tình huống/ngày, random): `SITUATIONS_PER_DAY_MIN = 3`,
  `SITUATIONS_PER_DAY_MAX = 4` (`src/types.ts`), chọn ngẫu nhiên mỗi ngày
  trong `pickWeekPlan` (`src/data/content.ts`).
- Bước 6–8 (mã số theo ngày, mở rương 7 mã số, đánh giá PKTL): mỗi lần hoàn
  thành minigame cuối ngày, reducer (`FINISH_MINIGAME` trong
  `src/state/gameContext.tsx`) sinh một chữ số ngẫu nhiên 0–9, lưu vào
  `session.dailyCodes` (giữ xuyên suốt cả tuần, khác với `keyFragments` — bộ
  đếm chỉ dùng trong ngày rồi reset). `RevealScreen.tsx` hiện mã số vừa nhận.
  Hết ngày thứ `DAYS_PER_WEEK` (7), màn hình mới `ChestOpenScreen.tsx` hiện đủ
  7 mã số và cho người chơi "mở rương", rồi mới sang `EvaluationScreen.tsx`.

## 7. Format trình bày

- **Hoạt hình nhân vật:** nhân vật minh họa có hành động, lời nói, biểu cảm
  sinh động thể hiện đúng mức độ phản kháng trong tình huống.
- **Giọng đọc tiếng Việt:** nhân vật có thể phát ra âm thanh tiếng Việt chuẩn
  để minh họa lời nói — đã hiện thực bằng Web Speech API tại `src/lib/speech.ts`
  (tự chọn giọng tiếng Việt tốt nhất có sẵn trên máy người chơi, `lang: "vi-VN"`).
- Minh họa cảnh/nhân vật hiện có tại `src/components/illustrations/`
  (`SceneIllustration.tsx`, `CharacterPortrait.tsx`, `GroupWorkScene.tsx`,
  `customScenes.tsx`).
