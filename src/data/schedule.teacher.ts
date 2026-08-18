import type { ScheduleItem } from "../types";

export const teacherSchedule: ScheduleItem[] = [
  { time: "6:45", title: "Đến trường sớm", location: "Cổng trường", caption: "Bạn ôm chồng giáo án bước vào trường." },
  { time: "7:00", title: "Đón học sinh đầu giờ", location: "Lớp học", caption: "Bạn đứng ở cửa lớp chào từng học sinh vào." },
  { time: "8:00 - 11:00", title: "Giảng dạy các tiết buổi sáng", location: "Lớp học", caption: "Bạn viết bài lên bảng, quan sát cả lớp." },
  { time: "11:30", title: "Ăn trưa, nghỉ ngơi", location: "Phòng giáo viên", caption: "Bạn tranh thủ chấm vài bài tập trong giờ nghỉ." },
  { time: "13:30 - 16:00", title: "Giảng dạy các tiết buổi chiều", location: "Lớp học", caption: "Bạn đi vòng quanh lớp kiểm tra bài làm của học sinh." },
  { time: "16:30", title: "Họp chuyên môn / soạn giáo án", location: "Phòng giáo viên", caption: "Bạn ngồi soạn lại kế hoạch bài giảng cho ngày mai." },
  { time: "18:00", title: "Về nhà", location: "Trên đường về", caption: "Bạn mang theo một chồng bài kiểm tra để chấm." },
  { time: "19:30", title: "Chấm bài, ghi nhận xét", location: "Bàn làm việc", caption: "Bạn cẩn thận viết lời phê vào từng bài." },
  { time: "20:30", title: "Trả lời tin nhắn phụ huynh", location: "Điện thoại", caption: "Bạn đọc và phản hồi vài tin nhắn từ phụ huynh." },
  { time: "22:00", title: "Nghỉ ngơi", location: "Nhà", caption: "Bạn xem lại danh sách học sinh cần quan tâm thêm." },
];
