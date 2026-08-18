import type { ScheduleItem } from "../types";

export const studentSchedule: ScheduleItem[] = [
  { time: "6:30", title: "Thức dậy, chuẩn bị đồng phục", location: "Nhà", caption: "Bạn xếp gọn sách vở vào cặp, kiểm tra lại thời khoá biểu." },
  { time: "7:00", title: "Đến trường", location: "Cổng trường", caption: "Bạn khoác cặp lên vai, bước nhanh qua cổng trước giờ vào lớp." },
  { time: "8:00 - 11:00", title: "Học các tiết buổi sáng", location: "Lớp học", caption: "Bạn lấy vở ra, chuẩn bị bút để ghi bài." },
  { time: "11:30", title: "Ăn trưa, nghỉ ngơi", location: "Căn tin", caption: "Bạn xếp hàng lấy khay cơm cùng bạn bè." },
  { time: "13:30 - 16:00", title: "Học các tiết buổi chiều", location: "Lớp học", caption: "Bạn mở cặp lấy sách môn tiếp theo." },
  { time: "16:30", title: "Về nhà", location: "Trên đường về", caption: "Bạn đeo cặp, tạm biệt bạn bè ở cổng trường." },
  { time: "17:30", title: "Nghỉ ngơi, phụ giúp việc nhà", location: "Nhà", caption: "Bạn cất cặp sách lên bàn học, thay đồ ở nhà." },
  { time: "19:00", title: "Ăn tối cùng gia đình", location: "Bàn ăn", caption: "Bạn ngồi vào bàn ăn cùng bố mẹ." },
  { time: "20:00", title: "Làm bài tập, ôn bài", location: "Bàn học", caption: "Bạn bật đèn bàn học, mở vở bài tập ra." },
  { time: "21:30", title: "Chuẩn bị đi ngủ", location: "Phòng ngủ", caption: "Bạn xếp lại cặp sách cho ngày mai rồi lên giường." },
];
