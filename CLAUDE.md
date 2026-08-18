# Moralyn (PKTL)

Webgame hoạt hình mô phỏng tình huống, đánh giá mức độ phản kháng tâm lý
(PKTL) của người chơi qua các tình huống bị áp đặt quy định ở trường/gia
đình, rồi đưa ra lời khuyên. React 19 + TypeScript + Vite, mobile-first,
không backend.

**Trước khi viết/sửa nội dung tình huống hoặc luồng chơi, đọc:**
- [`docs/GAME_DESCRIPTION.md`](docs/GAME_DESCRIPTION.md) — context chính:
  nhân vật, khung 4 mức phản kháng A–D, cấu trúc `Situation`, 3 tình huống
  mẫu gốc, kịch bản chơi (kể cả phần mới nhất chưa hiện thực hết).
- [`docs/CONTENT_PLAN.md`](docs/CONTENT_PLAN.md) — đối chiếu hiện trạng code
  vs mô tả mới nhất, các điểm lệch cần chốt hướng, việc có thể làm tiếp.
- [`GDD.md`](GDD.md) — thiết kế hệ thống free-roam (đề xuất mở rộng), trạng
  thái demo vs production.

## Lệnh thường dùng

```bash
npm run dev      # vite dev server, port 5183
npm run build    # tsc -b && vite build
npm run lint     # oxlint
npm run preview  # xem bản build
```

## Cấu trúc chính

- `src/data/situations.{student,parent,teacher}.ts` — nội dung tình huống
  theo từng vai (60 tình huống, mỗi vai 20).
- `src/screens/` — các màn hình chơi (SituationScreen, RevealScreen,
  DayEndScreen, EvaluationScreen, FreeRoamDemoScreen...).
- `src/state/gameContext.tsx` — state machine chính (`Screen` union,
  `PlaySession`).
- `src/types.ts` — kiểu dữ liệu + hằng số lõi (`DAYS_PER_WEEK`,
  `SITUATIONS_PER_DAY`).

## Phát hành (giữ nguyên link)

```bash
npm run release
```

Chạy `build` → `inline.cjs` → `build-artifact.cjs`, rồi copy ra
`MORALYN-GAME.html`. Kết quả:

- `MORALYN-GAME.html` — file offline gửi cho người chơi
- `moralyn-artifact.html` — bản đăng lên link chia sẻ

**Link chia sẻ cố định** (đăng đè lên chính link này, đừng tạo link mới —
người chơi đã có link cũ):

```
https://claude.ai/code/artifact/e9a651fd-5643-4365-af97-be0019b0c314
```

Đăng bằng tool Artifact với `file_path: moralyn-artifact.html` và truyền
`url` đúng bằng link trên. Không truyền `url` sẽ đẻ ra link mới.

Ảnh trong `public/images/` được `inline.cjs` tự quét và nhúng base64 — thêm
ảnh mới chỉ cần bỏ file vào thư mục, không phải khai báo tay. Script sẽ in
cảnh báo `NOT referenced by the bundle` nếu có ảnh không nhúng được.
