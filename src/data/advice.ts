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
      // D for a student is outright refusal — "Em không nộp đâu thầy. Phạt sao em chịu." —
      // not silence; this entry used to describe a quiet, enduring child, the opposite of
      // what the player had just picked
      dominant: "D",
      scoreLabel: "Người bất hợp tác",
      headline: "Bạn thường từ chối thẳng và chấp nhận chịu phạt",
      body:
        "Khi bị ép, bạn chọn không làm theo dù biết sẽ bị trừ điểm hay mời phụ huynh. Cách này giữ được cảm giác tự quyết, nhưng lý do thật của bạn không ai được nghe, còn hình phạt thì cứ nặng dần.",
      tips: [
        { emoji: "🗣️", title: "Nói ra lý do trước khi từ chối", text: "Một câu 'em không đồng ý vì...' giúp người lớn hiểu bạn không chỉ đang cãi." },
        { emoji: "⚖️", title: "Chọn việc đáng để phản đối", text: "Không phải quy định nào cũng cần chống lại — hãy dành sức cho điều thật sự quan trọng với bạn." },
        { emoji: "🤝", title: "Thử đưa ra một cách khác", text: "Đề xuất một cách làm thay thế thường được chấp nhận hơn là từ chối hoàn toàn." },
      ],
      extraNote: "Muốn được tự quyết là chính đáng. Khi bạn nói ra điều mình cần, người lớn mới có cơ hội thay đổi.",
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
      // C is "cấm đoán & chỉ trích": a ban that comes with a label for the child
      dominant: "C",
      scoreLabel: "Phụ huynh nghiêm khắc",
      headline: "Bạn hay cấm ngay và chê con để con nghe lời",
      body:
        "Khi con muốn làm điều gì đó, bạn thường cấm luôn, kèm những lời như 'lười', 'nhảm', 'ở bẩn'. Con có thể thôi cãi trước mặt bạn, nhưng lại thấy mình bị đánh giá và dễ làm lén sau lưng.",
      tips: [
        { emoji: "🌬️", title: "Dừng lại 3 giây trước khi phản ứng", text: "Một khoảng lặng nhỏ giúp bạn phản ứng bình tĩnh hơn." },
        { emoji: "🏷️", title: "Nói về việc làm, đừng gán nhãn con", text: "'Con thức khuya quá' dễ nghe hơn nhiều so với 'con lười', 'con hư'." },
        { emoji: "❓", title: "Hỏi trước khi cấm", text: "'Vì sao con muốn làm vậy?' có thể thay đổi cả cuộc trò chuyện." },
      ],
      extraNote: "Sự nghiêm khắc của bạn xuất phát từ tình yêu thương — hãy để con cảm nhận được điều đó rõ hơn.",
    },
    {
      // D is "áp đặt & đe dọa" — confiscations, cut allowances, locked doors. This entry used
      // to call that parent "dễ dãi", who lets things slide: the opposite of what they picked
      dominant: "D",
      scoreLabel: "Phụ huynh áp đặt",
      headline: "Bạn hay dùng hình phạt và lời doạ để con làm theo ngay",
      body:
        "Tịch thu điện thoại, cắt tiền tiêu vặt, khoá cửa — những lời doạ này khiến con làm theo ngay lúc đó. Nhưng con càng bị ép thì càng muốn chống lại: con giấu, nói dối hoặc lén làm khi bạn không thấy.",
      tips: [
        { emoji: "🧊", title: "Đợi nguôi giận rồi mới nói", text: "Lời doạ thường bật ra lúc nóng, còn quy tắc tốt thì được đặt ra lúc bình tĩnh." },
        { emoji: "📋", title: "Cùng con chốt hậu quả từ trước", text: "Thoả thuận trước nếu vi phạm thì sao, để hình phạt không đến bất ngờ." },
        { emoji: "💬", title: "Nói nỗi lo thay vì lời doạ", text: "'Bố mẹ lo con thức khuya sẽ mệt' giúp con hiểu bạn, còn 'đập máy' chỉ khiến con giấu." },
      ],
      extraNote: "Bạn làm vậy vì lo cho con. Khi con hiểu nỗi lo đó thay vì chỉ thấy hình phạt, con sẽ tự nguyện hợp tác hơn.",
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
      // C is "cấm đoán & chỉ trích": the remark that labels the student rather than the act
      dominant: "C",
      scoreLabel: "Người thầy nghiêm khắc",
      headline: "Bạn hay chê trách ngay khi học sinh làm khác ý",
      body:
        "Bạn thường nhận xét thẳng kiểu 'lười', 'thiếu trách nhiệm'. Học sinh có thể làm theo vì ngại, nhưng các em thấy mình bị đánh giá con người chứ không phải việc làm, và thôi không chia sẻ lý do thật.",
      tips: [
        { emoji: "🏷️", title: "Nhận xét việc làm, đừng gán nhãn", text: "'Bài này em chưa làm' khác xa 'em lười' trong mắt học sinh." },
        { emoji: "🤫", title: "Góp ý riêng thay vì trước lớp", text: "Nói chuyện riêng giữ được kỷ luật mà không làm học sinh xấu hổ." },
        { emoji: "❓", title: "Hỏi lý do trước khi nhận xét", text: "Nhiều hành vi có nguyên nhân mà học sinh ngại nói ra trước lớp." },
      ],
      extraNote: "Uy quyền của bạn rất rõ ràng — hãy để nó đi cùng sự tôn trọng dành cho học sinh.",
    },
    {
      // D is "áp đặt & đe dọa" — zero marks, confiscation, calling the parents in. This entry
      // used to describe a teacher who lets things pass: the opposite of what they picked
      dominant: "D",
      scoreLabel: "Người thầy áp đặt",
      headline: "Bạn hay dùng hình phạt nặng để dập vấn đề ngay tại chỗ",
      body:
        "Điểm 0, tịch thu, mời phụ huynh — cách này làm lớp im ngay lúc đó. Nhưng học sinh càng bị ép càng tìm cách chống lại: các em làm lén, giấu giếm, và lý do thật phía sau hành vi thì không bao giờ được nói ra.",
      tips: [
        { emoji: "📏", title: "Phạt vừa với lỗi", text: "Lỗi nhỏ mà bị phạt nặng khiến học sinh thấy bất công hơn là thấy mình sai." },
        { emoji: "📋", title: "Thống nhất hậu quả từ đầu", text: "Nội quy và hình phạt nói rõ trước thì học sinh dễ chấp nhận hơn khi bị xử lý." },
        { emoji: "🤝", title: "Hỏi riêng trước khi phạt", text: "Một câu 'có chuyện gì vậy em?' đôi khi giải quyết được nhiều hơn một lần mời phụ huynh." },
      ],
      extraNote: "Bạn muốn giữ lớp học nghiêm túc. Khi học sinh hiểu lý do thay vì chỉ sợ hình phạt, kỷ luật sẽ bền hơn.",
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
