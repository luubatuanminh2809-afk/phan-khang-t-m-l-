# Moralyn — Game Design Document
## Free-Roam Exploration System (đề xuất mở rộng)

> Tài liệu này mô tả cách nâng Moralyn từ "màn hình tĩnh + lựa chọn" lên một trải
> nghiệm mô phỏng sống động hơn, theo đúng yêu cầu: người chơi phải **trải nghiệm**
> tình huống trước khi bị hỏi, chứ không phải bị hỏi ngay khi vừa thấy một bức ảnh.
>
> Phần **"Trạng thái hiện tại"** ở mỗi mục mô tả những gì Moralyn đã có (đã chạy
> ổn định). Phần **"Đề xuất mở rộng"** là thiết kế cho hệ thống free-roam mới.
> Cuối tài liệu có bảng đối chiếu **Demo (đã build) vs Production (cần thêm)**.

---

## 1. Tổng quan / Vision

**Thể loại:** Simulation kể chuyện theo lượt tuần, pha thêm một lớp khám phá
không gian 2D top-down cho từng tình huống.

**Cảm giác mong muốn:** Người chơi *sống* trong khoảnh khắc — đi lại, quan sát,
nghe thấy những mẩu hội thoại xung quanh, thấy thế giới tiếp diễn dù mình không
làm gì — trước khi một sự kiện thật sự "chạm" vào họ và buộc phải phản ứng.

**Tham chiếu phong cách:** Life is Strange (camera lia theo bước chân, dừng lại
quan sát), Persona (giờ trong ngày, NPC có lịch trình riêng), Stardew Valley /
The Sims (idle animation liên tục, không bao giờ đứng hình).

**Ràng buộc công nghệ:** Web app (React + TypeScript, không backend). Đây là
điểm khác biệt lớn nhất so với các game tham chiếu — chúng chạy trên game engine
thật (Unity/native), còn Moralyn chạy trong trình duyệt, không có physics engine,
không pathfinding thật, không sprite-sheet animation. Thiết kế dưới đây được viết
để **khả thi trong giới hạn đó**, không giả vờ có năng lực của Unity.

---

## 2. Game Loop tổng thể (trạng thái hiện tại — giữ nguyên)

```
Cover → Chọn vai (Học sinh / Phụ huynh / Giáo viên)
  → 7 ngày, mỗi ngày 5 tình huống:
      [Tình huống] → chọn 1/4 phản ứng → phản ứng NPC → lời kết
      → (lặp 5 lần) → Thử thách cuối ngày → Reveal (suy nghĩ thật của NPC)
      → Ngày tiếp theo
  → Đủ 7 ngày → Đánh giá PKTL → Viết thư
```

Vòng lặp tuần này **không đổi**. Free-roam là một lớp trình bày mới cho MỘT
tình huống — không thay thế toàn bộ 36 tình huống, vì chi phí sản xuất (animation,
NPC AI, testing) cho từng cảnh là rất lớn (xem mục 8).

---

## 3. Free-Roam Exploration System (đề xuất mở rộng)

### 3.1 Không gian chơi
- Một cảnh = một ảnh nền top-down/góc nghiêng nhẹ (tái dùng bộ ảnh cảnh hiện có:
  `classroom`, `hallway_yard`, `living_room`...), phủ một **vùng di chuyển được**
  (bounding box) nhỏ hơn toàn khung hình — người chơi không đi ra ngoài khung.
- Không dùng tilemap/pathfinding thật — chỉ là một mặt phẳng 2D với toạ độ (x, y)
  bị giới hạn trong vùng chơi được, đủ để tạo cảm giác "đi lại tự do" mà không
  cần dựng lưới va chạm phức tạp.

### 3.2 Điều khiển người chơi
- **Desktop:** phím mũi tên / WASD, giữ phím = di chuyển liên tục theo hướng.
- **Mobile (ưu tiên, vì Moralyn mobile-first):** D-pad ảo 4 hướng ở góc dưới màn
  hình, giữ để di chuyển.
- Nhân vật (dùng đúng ảnh cắt nhân vật đã có, nay đã trong suốt thật) di chuyển
  bằng cách cập nhật toạ độ mỗi khung hình (`requestAnimationFrame`), có animation
  "đang bước" nhẹ (lắc lư) khi di chuyển, đứng yên (thở nhẹ) khi dừng.
- Camera không thật sự "lia" (không có camera 3D) — thay vào đó mô phỏng bằng
  cách hơi zoom/pan nền theo vị trí người chơi (parallax nhẹ), đủ tạo cảm giác
  chiều sâu mà không cần render 3D thật.

### 3.3 NPC AI (rút gọn, không phải AI thật)
NPC không có pathfinding hay tri giác thật — đây là **finite state machine 3
trạng thái**, đủ để tạo cảm giác "đang sống":

| Trạng thái | Hành vi |
|---|---|
| `idle` | Đứng yên tại chỗ, chạy animation thở/nhìn quanh (lặp lại bằng CSS keyframe) |
| `wander` | Cứ mỗi 2–4 giây, chọn ngẫu nhiên 1 điểm trong "vùng lượn" định sẵn quanh NPC, di chuyển tới đó bằng CSS transition |
| `alert` | Khi người chơi lại gần trong bán kính tương tác, NPC quay mặt về phía người chơi và dừng wander, hiện gợi ý "Chạm để nói chuyện" |

### 3.4 Hệ thống sự kiện nền (ambient events) — áp đúng luật bạn đưa ra
Trước khi bất kỳ lựa chọn nào hiện ra, cảnh phải phát sinh **tối thiểu 15 sự
kiện gameplay nhỏ**, ví dụ: chuông trường vang, một bạn vẫy tay, điện thoại
rung, tiếng cười vọng lại, NPC đổi hướng nhìn, một dòng hội thoại nền thoáng qua...

- Cài đặt bằng một **hàng đợi sự kiện** (event queue) chạy nền: mỗi 1.5–3 giây,
  lấy ra 1 sự kiện ngẫu nhiên từ pool, hiển thị dạng toast/bong bóng nhỏ 2–3
  giây rồi biến mất — không chặn thao tác di chuyển của người chơi.
- Bộ đếm sự kiện đã hiện + thời gian đã trôi qua (mục tiêu 30–90 giây) quyết
  định khi nào **mở khoá** tương tác với NPC kích hoạt tình huống thật.
- Không có gì bị "đứng hình" chờ người chơi — nếu người chơi đứng yên, NPC vẫn
  wander, sự kiện nền vẫn phát sinh.

### 3.5 Sự kiện kích hoạt (trigger event) → bàn giao cho hệ thống hội thoại có sẵn
Khi điều kiện mục 3.4 đủ, một gợi ý tương tác hiện lên gần NPC. Người chơi chủ
động chạm vào để bắt đầu — **không tự động bật lên khi vừa vào cảnh**. Lúc này
free-roam chuyển giao mượt sang **hệ thống hội thoại + lựa chọn đã có sẵn**
(SituationScreen hiện tại) — không cần xây lại dialogue system từ đầu.

---

## 4. Dialogue & Choice System (trạng thái hiện tại — tái sử dụng nguyên vẹn)
Đã có và chạy ổn định: multi-beat narration → thoại chính → 4 lựa chọn (theo 4
phong cách phản kháng tâm lý) → phản ứng NPC → lời kết. Free-roam chỉ là một
"cửa vào" mới cho hệ thống này, không thay thế nó.

---

## 5. State Machine (trạng thái hiện tại, mở rộng)
`GameContext` hiện quản lý một `Screen` union (`cover` → `roleSelect` →
`dayIntro` → `situation` → `minigame` → `reveal` → ...) qua `useReducer`. Cảnh
demo free-roam được thêm như **một screen độc lập** (`freeRoamDemo`), không đụng
vào luồng tuần thật (7 ngày × 5 tình huống) đang chạy ổn định — tránh rủi ro làm
hỏng phần đã kiểm thử kỹ khi thử nghiệm công nghệ mới.

---

## 6. Kiến trúc kỹ thuật đề xuất
- Không dùng canvas/WebGL (không cần thiết cho quy mô 1 người chơi + 1 NPC/cảnh,
  và giữ code đơn giản, dễ bảo trì bằng React thuần).
- Vị trí nhân vật/NPC là state React (`{x, y}` tính theo % khung chơi), render
  bằng `position: absolute`, cập nhật qua `requestAnimationFrame`.
- Toàn bộ animation dùng CSS keyframes (đã có sẵn pattern này trong codebase:
  `animate-char-bob`, `animate-char-react`...).

---

## 7. Bảng đối chiếu: Demo (đã build) vs Production

| Hạng mục | Demo (1 cảnh, đã build) | Production (nếu làm cho cả 36 tình huống) |
|---|---|---|
| Di chuyển tự do | ✅ 1 cảnh, D-pad + phím | Cần cho từng cảnh, tuỳ bố cục nền khác nhau |
| NPC wander AI | ✅ 1 NPC, 3 trạng thái | Cần định nghĩa vùng wander riêng cho từng NPC/cảnh |
| Sự kiện nền (15+/cảnh) | ✅ pool ~15 sự kiện cho 1 cảnh | Cần viết pool riêng, phù hợp ngữ cảnh, cho từng cảnh |
| Bàn giao sang hội thoại | ✅ dùng lại hệ thống có sẵn | Không đổi |
| Nhiều NPC cùng lúc | ❌ chưa làm | Cần quản lý nhiều state machine song song |
| Va chạm với vật thể (bàn, ghế) | ❌ chỉ giới hạn khung ngoài | Cần bounding box riêng cho từng vật cản |
| Chi phí production | — | Ước tính: mỗi cảnh cần thiết kế vùng chơi + pool sự kiện + test riêng — không tự động hoá được, phải làm tay từng cảnh |

**Khuyến nghị:** Dùng demo này làm **bằng chứng khái niệm cho báo cáo KHKT**
(chứng minh kỹ thuật khả thi trong web app thuần, không cần engine ngoài), còn
36 tình huống chính vẫn giữ định dạng hiện tại (đã hoàn thiện, đã test kỹ) để
đảm bảo sản phẩm nộp ổn định đúng hạn.
