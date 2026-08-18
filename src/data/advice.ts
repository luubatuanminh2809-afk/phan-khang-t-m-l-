import type { AdviceEntry, Role } from "../types";

export const adviceByRole: Record<Role, AdviceEntry[]> = {
  student: [
    {
      dominant: "A",
      scoreLabel: "Nhà thương lượng",
      headline: "Bạn biết cách nói ra điều mình muốn một cách bình tĩnh",
      body:
        "Phần lớn tình huống bạn chọn cách trao đổi thẳng thắn với người lớn thay vì né tránh hay chống đối. Đây là kỹ năng quý giá — nó giúp người lớn tin tưởng bạn hơn và sẵn sàng lắng nghe bạn nhiều hơn trong tương lai.",
      tips: [
        { emoji: "🗣️", title: "Giữ vững cách nói thẳng", text: "Tiếp tục trình bày điều mình muốn rõ ràng, đừng chỉ đề xuất giải pháp mà quên nói ra cảm xúc thật." },
        { emoji: "📝", title: "Ghi lại những lần thành công", text: "Viết ra những lần thương lượng hiệu quả để nhận ra cách nói nào khiến người lớn dễ đồng ý nhất." },
        { emoji: "🤝", title: "Rủ người lớn cùng đặt quy tắc", text: "Khi có quy định mới, hãy chủ động đề nghị cùng bàn bạc trước thay vì chờ bị áp đặt." },
      ],
      extraNote: "Bạn đang có nền tảng giao tiếp tốt. Hãy giúp bạn bè xung quanh học theo cách thương lượng nhẹ nhàng này.",
    },
    {
      dominant: "B",
      scoreLabel: "Người khéo léo né tránh",
      headline: "Bạn hay chọn cách lách qua thay vì đối mặt trực tiếp",
      body:
        "Bạn thường tìm đường vòng để không phải xung đột. Cách này giúp tránh căng thẳng trước mắt, nhưng về lâu dài có thể khiến người lớn khó tin tưởng bạn hơn nếu họ phát hiện ra.",
      tips: [
        { emoji: "🎯", title: "Thử nói thẳng một lần", text: "Chọn một tình huống nhỏ trong tuần này để nói thật điều bạn muốn thay vì lách qua." },
        { emoji: "🪞", title: "Tự hỏi vì sao mình ngại", text: "Ghi ra điều khiến bạn sợ khi đối mặt trực tiếp với người lớn." },
        { emoji: "💬", title: "Chuẩn bị sẵn một câu mở đầu", text: "Ví dụ: 'Con muốn nói thật với mẹ về...' để dễ bắt đầu hơn." },
      ],
      extraNote: "Né tránh giúp bạn thoát khỏi xung đột ngay lúc đó, nhưng nói thật sớm sẽ giúp mối quan hệ bền hơn.",
    },
    {
      dominant: "C",
      scoreLabel: "Người phản kháng công khai",
      headline: "Bạn không ngại lên tiếng, nhưng đôi khi hơi gay gắt",
      body:
        "Bạn dám bảo vệ quan điểm của mình, đó là điều tốt. Nhưng phản ứng quá gay gắt dễ khiến cuộc trò chuyện biến thành tranh cãi, và thông điệp thật sự của bạn có thể bị lu mờ bởi cảm xúc nóng giận.",
      tips: [
        { emoji: "🌬️", title: "Hít thở 3 nhịp trước khi nói", text: "Cho mình vài giây để bình tĩnh lại trước khi phản ứng." },
        { emoji: "✍️", title: "Viết ra điều muốn nói trước", text: "Sắp xếp suy nghĩ trên giấy giúp lời nói bớt gay gắt hơn khi nói ra." },
        { emoji: "🎧", title: "Nghe hết câu trước khi phản bác", text: "Đôi khi người lớn chưa nói hết ý, phản ứng vội dễ gây hiểu lầm." },
      ],
      extraNote: "Sự thẳng thắn của bạn là điểm mạnh — chỉ cần thêm một nhịp bình tĩnh, thông điệp sẽ được đón nhận tốt hơn.",
    },
    {
      dominant: "D",
      scoreLabel: "Người im lặng chịu đựng",
      headline: "Bạn hay chọn im lặng, dù trong lòng không đồng ý",
      body:
        "Bạn né tránh xung đột bằng cách không phản ứng gì cả, nhưng điều đó không có nghĩa là ổn — cảm xúc thật của bạn cần một chỗ để được nói ra, nếu không sẽ tích tụ dần.",
      tips: [
        { emoji: "📣", title: "Tập nói một câu ngắn về cảm xúc", text: "Chỉ cần 'con hơi buồn vì...' cũng đã là một bước tiến lớn." },
        { emoji: "📓", title: "Viết nhật ký cảm xúc", text: "Ghi lại điều bạn thực sự nghĩ sau mỗi lần im lặng để hiểu rõ bản thân hơn." },
        { emoji: "🧑‍🤝‍🧑", title: "Tìm một người bạn tin tưởng", text: "Tập chia sẻ với bạn thân trước khi nói với người lớn sẽ dễ hơn." },
      ],
      extraNote: "Im lặng không có nghĩa là bạn ổn. Cảm xúc của bạn xứng đáng được lắng nghe.",
    },
  ],
  parent: [
    {
      dominant: "A",
      scoreLabel: "Phụ huynh đồng hành",
      headline: "Bạn ưu tiên lắng nghe con trước khi đưa ra quyết định",
      body:
        "Phần lớn tình huống bạn chọn cách tìm hiểu cảm xúc và lý do của con trước khi phản ứng. Đây chính là điều giúp con cảm thấy an toàn để chia sẻ thật lòng, thay vì phải giấu diếm hay nói dối.",
      tips: [
        { emoji: "👂", title: "Tiếp tục hỏi trước khi quyết", text: "Giữ thói quen hỏi cảm xúc và lý do của con trước khi đưa ra quyết định." },
        { emoji: "📅", title: "Ghi lại những cuộc trò chuyện tốt", text: "Ghi nhớ những lần con cởi mở để hiểu điều gì khiến con tin tưởng chia sẻ." },
        { emoji: "🕰️", title: "Dành thời gian riêng cho con", text: "Một khoảng thời gian ngắn mỗi ngày không nói về học tập cũng giúp con thấy được lắng nghe." },
      ],
      extraNote: "Bạn đang xây dựng nền tảng tin tưởng rất tốt với con. Hãy kiên nhẫn ngay cả khi con phản ứng mạnh.",
    },
    {
      dominant: "B",
      scoreLabel: "Phụ huynh nguyên tắc",
      headline: "Bạn giữ vững quy tắc nhưng vẫn giải thích lý do",
      body:
        "Bạn có xu hướng đặt ra giới hạn rõ ràng và giải thích vì sao. Cách này giúp con hiểu được kỳ vọng của bạn, nhưng nếu thiếu bước lắng nghe trước, con có thể cảm thấy quyết định đã được chốt sẵn dù con có nói gì đi nữa.",
      tips: [
        { emoji: "⏸️", title: "Hỏi trước khi giải thích", text: "Dành 30 giây hỏi con nghĩ gì trước khi đưa ra quy tắc." },
        { emoji: "🎯", title: "Giữ quy tắc nhất quán", text: "Quy định rõ ràng giúp con biết điều gì được mong đợi, nhưng hãy linh hoạt khi hoàn cảnh thay đổi." },
        { emoji: "💬", title: "Giải thích lý do thay vì chỉ ra lệnh", text: "Con dễ chấp nhận hơn khi hiểu vì sao bố/mẹ đặt ra quy tắc đó." },
      ],
      extraNote: "Nguyên tắc rõ ràng là tốt — chỉ cần thêm một chút lắng nghe để con cảm thấy được tôn trọng.",
    },
    {
      dominant: "C",
      scoreLabel: "Phụ huynh nghiêm khắc",
      headline: "Bạn phản ứng nhanh và dứt khoát, nhưng đôi khi thiếu giải thích",
      body:
        "Bạn thường phản ứng mạnh khi con có hành vi không như ý. Điều này có thể khiến con sợ và vâng lời trước mặt bạn, nhưng lại khiến con ngại chia sẻ thật lòng và dễ tìm cách giấu giếm về sau.",
      tips: [
        { emoji: "🌬️", title: "Dừng lại 3 giây trước khi phản ứng", text: "Một khoảng lặng nhỏ giúp bạn phản ứng bình tĩnh hơn." },
        { emoji: "❓", title: "Hỏi trước khi kết luận", text: "'Chuyện gì đã xảy ra vậy con?' là câu hỏi có thể thay đổi cả cuộc trò chuyện." },
        { emoji: "🤗", title: "Cho con biết bạn vẫn yêu thương", text: "Ngay cả khi nghiêm khắc, hãy chắc con hiểu điều đó xuất phát từ tình yêu thương." },
      ],
      extraNote: "Sự nghiêm khắc của bạn xuất phát từ tình yêu thương — hãy để con cảm nhận được điều đó rõ hơn.",
    },
    {
      dominant: "D",
      scoreLabel: "Phụ huynh dễ dãi",
      headline: "Bạn hay bỏ qua để tránh xung đột trước mắt",
      body:
        "Bạn thường chọn cách không can thiệp để giữ hoà khí. Điều này giúp giảm căng thẳng tức thời, nhưng con có thể hiểu lầm rằng bạn không thực sự quan tâm đến điều con đang trải qua.",
      tips: [
        { emoji: "📱", title: "Chủ động hỏi thăm mỗi ngày", text: "Một câu hỏi ngắn cũng cho con biết bạn đang để ý." },
        { emoji: "🔍", title: "Quan sát những thay đổi nhỏ", text: "Chú ý biểu cảm, thói quen của con để nhận ra khi con cần giúp đỡ." },
        { emoji: "🕯️", title: "Đặt ra vài giới hạn nhẹ nhàng", text: "Không cần nghiêm khắc, nhưng một vài quy tắc nhỏ giúp con cảm thấy được quan tâm." },
      ],
      extraNote: "Sự thoải mái là tốt, nhưng con vẫn cần cảm nhận được sự hiện diện và quan tâm của bạn.",
    },
  ],
  teacher: [
    {
      dominant: "A",
      scoreLabel: "Người thầy thấu cảm",
      headline: "Bạn luôn tìm hiểu nguyên nhân trước khi đánh giá học sinh",
      body:
        "Phần lớn tình huống bạn chọn cách quan tâm, tìm hiểu lý do đằng sau hành vi của học sinh. Cách tiếp cận này giúp học sinh cảm thấy được tôn trọng và sẵn sàng cởi mở hơn với bạn trong lớp học.",
      tips: [
        { emoji: "💛", title: "Tiếp tục tìm hiểu trước khi đánh giá", text: "Giữ thói quen hỏi lý do đằng sau hành vi của học sinh." },
        { emoji: "🗣️", title: "Nói ra sự thấu cảm của bạn", text: "Đôi khi hãy cho học sinh biết bạn hiểu điều các em đang trải qua." },
        { emoji: "🌱", title: "Chia sẻ cách tiếp cận này với đồng nghiệp", text: "Sự thấu cảm của bạn có thể truyền cảm hứng cho cả tập thể giáo viên." },
      ],
      extraNote: "Bạn đang tạo ra một lớp học an toàn để học sinh được là chính mình.",
    },
    {
      dominant: "B",
      scoreLabel: "Người thầy nguyên tắc",
      headline: "Bạn giữ kỷ luật lớp học nhưng vẫn giải thích rõ ràng",
      body:
        "Bạn có xu hướng nhắc nhở đúng mực và giải thích lý do đằng sau các yêu cầu. Điều này giúp lớp học có trật tự, nhưng nếu áp dụng đồng loạt cho mọi học sinh mà không hỏi trước, một số em có hoàn cảnh đặc biệt có thể cảm thấy không được thấu hiểu.",
      tips: [
        { emoji: "🎯", title: "Hỏi riêng trước khi áp dụng quy tắc chung", text: "Với học sinh có biểu hiện bất thường, một câu hỏi riêng trước sẽ hiệu quả hơn." },
        { emoji: "📖", title: "Giải thích lý do của nội quy", text: "Học sinh tuân thủ tốt hơn khi hiểu vì sao quy định tồn tại." },
        { emoji: "🔄", title: "Linh hoạt khi cần thiết", text: "Giữ nguyên tắc nhưng sẵn sàng điều chỉnh khi hoàn cảnh của học sinh đặc biệt." },
      ],
      extraNote: "Kỷ luật rõ ràng giúp lớp học ổn định — chỉ cần thêm sự linh hoạt đúng lúc.",
    },
    {
      dominant: "C",
      scoreLabel: "Người thầy nghiêm khắc",
      headline: "Bạn xử lý nhanh và dứt khoát, đôi khi công khai trước lớp",
      body:
        "Bạn thường phản ứng mạnh để giữ kỷ luật ngay lập tức. Cách này hiệu quả trong việc kiểm soát lớp học, nhưng phê bình công khai dễ khiến học sinh xấu hổ trước bạn bè và mất niềm tin để chia sẻ vấn đề thật của mình.",
      tips: [
        { emoji: "🤫", title: "Tách riêng học sinh trước khi xử lý", text: "Nói chuyện riêng giúp giữ được kỷ luật mà không làm học sinh xấu hổ." },
        { emoji: "🌬️", title: "Hạ giọng trước khi phản ứng", text: "Một giọng nói bình tĩnh vẫn giữ được uy quyền mà không gây sợ hãi." },
        { emoji: "🤝", title: "Khôi phục lại sau khi xử lý", text: "Một câu hỏi thăm sau đó giúp học sinh biết bạn không giữ ác cảm." },
      ],
      extraNote: "Uy quyền của bạn rất rõ ràng — hãy để nó đi cùng sự tôn trọng dành cho học sinh.",
    },
    {
      dominant: "D",
      scoreLabel: "Người thầy dễ bỏ qua",
      headline: "Bạn hay để tình huống trôi qua để không làm gián đoạn giờ học",
      body:
        "Bạn thường chọn không can thiệp để giữ tiến độ bài giảng. Điều này giúp lớp học trôi chảy, nhưng những học sinh đang gặp khó khăn thật sự có thể cảm thấy mình không quan trọng nếu không ai để ý đến các em.",
      tips: [
        { emoji: "⏱️", title: "Dành một câu hỏi sau giờ học", text: "'Em ổn không?' không mất nhiều thời gian nhưng rất có giá trị." },
        { emoji: "👀", title: "Quan sát học sinh im lặng", text: "Những em ít nói thường là người cần được để ý nhất." },
        { emoji: "🗒️", title: "Ghi chú những học sinh cần quan tâm", text: "Một danh sách nhỏ giúp bạn không bỏ sót ai." },
      ],
      extraNote: "Sự dễ chịu của bạn tạo không khí thoải mái — chỉ cần thêm một chút chủ động quan tâm.",
    },
  ],
};

export const roleMeta: Record<Role, { title: string; tagline: string; accent: string }> = {
  student: {
    title: "Học sinh",
    tagline: "Hoá thân thành học sinh, trải qua một ngày với những tình huống ở trường và ở nhà.",
    accent: "from-sky-400 to-blue-500",
  },
  parent: {
    title: "Phụ huynh",
    tagline: "Hoá thân thành bố mẹ, học cách lắng nghe và đồng hành cùng con mỗi ngày.",
    accent: "from-amber-400 to-orange-500",
  },
  teacher: {
    title: "Giáo viên",
    tagline: "Hoá thân thành thầy cô, thấu hiểu học trò đằng sau mỗi hành vi trên lớp.",
    accent: "from-emerald-400 to-teal-500",
  },
};
