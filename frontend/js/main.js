
const initialDocuments = [
    {
        id: 1,
        title: "Giáo trình Lập trình C++ Nâng cao & OOP",
        author: "Khoa CNTT - HUMG",
        uploader: "Thầy Nguyễn Văn Đức",
        major: "CNTT",
        subject: "Lập trình C++",
        type: "giao-trinh",
        format: "PDF (8.5 MB)",
        downloads: 1420,
        rating: 4.9,
        baseScore: 92,
        aiReason: "Phù hợp với môn Lập trình C++.",
        bookmarked: false,
        likes: 310
    },
    {
        id: 2,
        title: "Bộ Đề thi & Đáp án chi tiết Vi điều khiển & IoT",
        author: "CLB Sinh viên NCKH Cơ điện tử",
        uploader: "Lê Minh Tuấn (K66)",
        major: "Cơ điện tử",
        subject: "Vi điều khiển & IoT",
        type: "de-thi",
        format: "PDF & Code Zip",
        downloads: 890,
        rating: 4.8,
        baseScore: 88,
        aiReason: "Phù hợp với mục tiêu ôn thi.",
        bookmarked: true,
        likes: 245
    },
    {
        id: 3,
        title: "Slide Bài giảng Đại số Tuyến tính",
        author: "Bộ môn Toán ứng dụng",
        uploader: "Cô Trần Thị Mai",
        major: "CNTT",
        subject: "Đại số Tuyến tính",
        type: "slide",
        format: "PPTX (15 Slide)",
        downloads: 2150,
        rating: 4.7,
        baseScore: 84,
        aiReason: "Tài liệu đại cương cho học kỳ 1.",
        bookmarked: false,
        likes: 512
    },
    {
        id: 4,
        title: "Giáo trình Trắc địa Đại cương",
        author: "NXB Giao thông Vận tải",
        uploader: "Phạm Quốc Hùng",
        major: "Trắc địa - Địa tin học",
        subject: "Trắc địa đại cương",
        type: "giao-trinh",
        format: "Sách in cũ",
        downloads: 340,
        rating: 4.6,
        baseScore: 76,
        aiReason: "Phù hợp với ngành Trắc địa.",
        bookmarked: false,
        likes: 98
    },
    {
        id: 5,
        title: "Tổng hợp Lý thuyết & Bài tập Địa chất Đại cương",
        author: "Khoa Dầu khí",
        uploader: "Hoàng Anh Tuấn",
        major: "Địa chất - Dầu khí",
        subject: "Địa chất đại cương",
        type: "slide",
        format: "PDF (12 MB)",
        downloads: 620,
        rating: 4.5,
        baseScore: 70,
        aiReason: "Dành cho sinh viên khối ngành Địa chất.",
        bookmarked: false,
        likes: 120
    }
];


// Dán nguyên mảng initialExchangeBooks gồm 4 sách
// từ code gốc vào đây.

const initialExchangeBooks = [
    {
        id: 101,
        title: "Sách Giáo trình Cơ học Lý thuyết (Tập 1)",
        owner: "Trần Văn Bình (K65)",
        major: "Cơ điện tử",
        condition: "Mới 90% - Có Highlight",
        mode: "Tặng 0đ",
        contact: "Zalo: 0912.345.xxx (KTX Tầng 3)",
        time: "10 phút trước"
    },
    {
        id: 102,
        title: "Giáo trình Lập trình Python cho Khoa học Dữ liệu",
        owner: "Đặng Thu Thảo (K66)",
        major: "CNTT",
        condition: "Mới 98%",
        mode: "Đổi lấy sách IoT",
        contact: "FB: fb.com/thaodang.humg",
        time: "1 giờ trước"
    },
    {
        id: 103,
        title: "Sách Hướng dẫn Đo đạc Trắc địa Công trình",
        owner: "Nguyễn Huy Hoàng (K64)",
        major: "Trắc địa",
        condition: "Cũ - Đọc tốt",
        mode: "Nhượng 15k",
        contact: "SĐT: 0988.777.xxx",
        time: "3 giờ trước"
    },
    {
        id: 104,
        title: "Giáo trình Hóa học Đại cương Kỹ thuật",
        owner: "Phan Mỹ Linh (K67)",
        major: "Địa chất - Dầu khí",
        condition: "Mới 95%",
        mode: "Tặng 0đ",
        contact: "Zalo: 0399.111.xxx",
        time: "Hôm qua"
    }
];


// ============================================
// 2. APPLICATION STATE
// ============================================

let documents = [...initialDocuments];

let exchangeBooks = [...initialExchangeBooks];

let currentFilterType = 'all';

let totalInteractions = 0;


// ============================================
// 3. START APPLICATION
// ============================================

window.addEventListener('DOMContentLoaded', () => {

    lucide.createIcons();

    setupThemeToggle();

    renderDocuments();

    renderExchangeBooks();

    addLog(
        "AI Recommendation Engine initialized. Hybrid Matrix active."
    );

    restoreAuthSession();

    updateProfileFilters();

});


// ============================================
// 4. THEME TOGGLE
// ============================================

function setupThemeToggle() {

    const btn = document.getElementById('themeToggleBtn');

    const sunIcon = document.getElementById('sunIcon');

    const moonIcon = document.getElementById('moonIcon');

    btn.addEventListener('click', () => {

        document.documentElement.classList.toggle('dark');

        const isDark =
            document.documentElement.classList.contains('dark');

        if (isDark) {

            sunIcon.classList.add('hidden');

            moonIcon.classList.remove('hidden');

            showToast(
                "Đã chuyển sang Dark Mode",
                "Giao diện tối ưu cho mắt khi học đêm."
            );

        } else {

            sunIcon.classList.remove('hidden');

            moonIcon.classList.add('hidden');

            showToast(
                "Đã chuyển sang Light Mode",
                "Giao diện sáng sủa, rõ ràng."
            );

        }

    });

}


// ============================================
// 5. RECOMMENDATION ALGORITHM
// ============================================

function calculateMatchScore(doc) {

    const majorWeight =
        parseInt(document.getElementById('sliderMajor').value) / 100;

    const popWeight =
        parseInt(document.getElementById('sliderPopularity').value) / 100;

    const histWeight =
        parseInt(document.getElementById('sliderHistory').value) / 100;

    const selectedMajor =
        document.getElementById('selectMajor').value;

    let majorScore =
        doc.major === selectedMajor ? 100 : 40;

    let popScore =
        Math.min(100, (doc.downloads / 2500) * 100);

    let histScore =
        doc.bookmarked ? 95 : (doc.likes > 200 ? 80 : 50);

    const totalWeight =
        majorWeight + popWeight + histWeight;

    if (totalWeight === 0) {
        return doc.baseScore;
    }

    let finalScore = Math.round(
        (
            majorScore * majorWeight +
            popScore * popWeight +
            histScore * histWeight
        ) / totalWeight
    );

    return Math.min(99, Math.max(50, finalScore));

}


// ============================================
// 6. CHANGE RECOMMENDATION WEIGHTS
// ============================================

function onWeightChange() {

    document.getElementById('weightMajorVal').textContent =
        document.getElementById('sliderMajor').value + '%';

    document.getElementById('weightPopularityVal').textContent =
        document.getElementById('sliderPopularity').value + '%';

    document.getElementById('weightHistoryVal').textContent =
        document.getElementById('sliderHistory').value + '%';

    renderDocuments();

    addLog(
        `Trọng số gợi ý thay đổi: Ngành ${
            document.getElementById('sliderMajor').value
        }%, Xu hướng ${
            document.getElementById('sliderPopularity').value
        }%, Lịch sử ${
            document.getElementById('sliderHistory').value
        }%`
    );

}


// Khôi phục trọng số mặc định
function resetSliders() {

    document.getElementById('sliderMajor').value = 80;

    document.getElementById('sliderPopularity').value = 65;

    document.getElementById('sliderHistory').value = 90;

    onWeightChange();

    showToast(
        "Đã khôi phục trọng số",
        "Cấu hình AI gợi ý về mặc định."
    );

}


// ============================================
// 7. UPDATE STUDENT PROFILE
// ============================================

function updateProfileFilters() {

    const major =
        document.getElementById('selectMajor').value;

    const goal =
        document.getElementById('selectGoal').value;

    document.getElementById('userMajorBadge').textContent = major;

    const insightTitle =
        document.getElementById('aiInsightTitle');

    const insightText =
        document.getElementById('aiInsightText');

    insightTitle.textContent =
        `Tối ưu gợi ý cho ngành ${major}`;

    insightText.textContent =
        `Hệ thống vừa cập nhật ma trận gợi ý dựa trên mục tiêu ${goal} của sinh viên ngành ${major}. Các tài liệu trùng khớp đã được đẩy lên đầu.`;

    renderDocuments();

    addLog(
        `Cập nhật hồ sơ học tập -> Ngành: ${major} | Mục tiêu: ${goal}`
    );

}


// ============================================
// 8. DOCUMENT SEARCH
// ============================================

document.getElementById('searchInput').addEventListener(
    'input',
    () => {
        renderDocuments();
    }
);


// ============================================
// 9. DOCUMENT FILTER
// ============================================

function filterType(type) {

    currentFilterType = type;

    document.querySelectorAll('.tab-btn').forEach(btn => {

        btn.classList.remove(
            'bg-brand-600',
            'text-white',
            'shadow'
        );

        btn.classList.add('text-slate-300');

        btn.classList.remove('active');

        if (btn.dataset.type === type) {

            btn.classList.add(
                'bg-brand-600',
                'text-white',
                'shadow',
                'active'
            );

            btn.classList.remove('text-slate-300');

        }

    });

    renderDocuments();

    addLog(`Lọc danh mục tài liệu -> [${type}]`);

}


// ============================================
// 10. DOCUMENT INTERACTIONS
// ============================================

function handleAction(actionType, docId) {

    const doc = documents.find(d => d.id === docId);

    if (!doc) return;

    totalInteractions++;

    document.getElementById('statInteractions').textContent =
        totalInteractions;

    if (actionType === 'like') {

        doc.likes++;

        showToast(
            "Đã thích tài liệu!",
            `Bạn đã thả tim cho: ${doc.title}`
        );

        addLog(
            `[User Action] LIKED: "${doc.title}" - ${doc.subject}`
        );

    } else if (actionType === 'download') {

        doc.downloads++;

        showToast(
            "Bắt đầu tải xuống...",
            `Đang tải: ${doc.title} (${doc.format})`
        );

        addLog(
            `[User Action] DOWNLOADED: "${doc.title}" - ${doc.subject}`
        );

    }

    renderDocuments();

}


// Lưu hoặc bỏ lưu tài liệu
function toggleBookmark(docId) {

    const doc = documents.find(d => d.id === docId);

    if (!doc) return;

    doc.bookmarked = !doc.bookmarked;

    totalInteractions++;

    document.getElementById('statInteractions').textContent =
        totalInteractions;

    if (doc.bookmarked) {

        showToast(
            "Đã lưu Bookmark",
            "Tài liệu đã được lưu vào tủ sách cá nhân."
        );

        addLog(
            `[User Action] BOOKMARKED: "${doc.title}"`
        );

    } else {

        showToast(
            "Đã hủy Bookmark",
            "Đã xóa tài liệu khỏi danh sách lưu."
        );

        addLog(
            `[User Action] UN-BOOKMARKED: "${doc.title}"`
        );

    }

    renderDocuments();

}


// ============================================
// 11. EXCHANGE BOOK REQUEST
// ============================================

function requestExchange(title, owner) {

    showToast(
        "Đã gửi yêu cầu!",
        `Hệ thống đã kết nối bạn với ${owner} để nhận sách "${title}".`
    );

    addLog(
        `[Exchange Request] Sinh viên đăng ký trao đổi sách: ${title}`
    );

}


// ============================================
// 12. UPLOAD DOCUMENT
// ============================================

function handleUploadSubmit(event) {

    event.preventDefault();

    const title =
        document.getElementById('upTitle').value;

    const major =
        document.getElementById('upMajor').value;

    const type =
        document.getElementById('upType').value;

    const subject =
        document.getElementById('upSubject').value;

    const newDoc = {

        id: Date.now(),

        title: title,

        author: "Sinh viên đóng góp",

        uploader: "Bạn (Phiên hiện tại)",

        major: major,

        subject: subject,

        type: type,

        format: "PDF (Vừa tải lên)",

        downloads: 1,

        rating: 5.0,

        baseScore: 95,

        aiReason: "Tài liệu mới đóng góp gần đây bởi bạn.",

        bookmarked: true,

        likes: 1

    };

    documents.unshift(newDoc);

    closeModal('uploadModal');

    renderDocuments();

    showToast(
        "Tải lên thành công!",
        `Tài liệu "${title}" đã được AI phân loại vào môn ${subject}.`
    );

    addLog(
        `[User Upload] Tải lên tài liệu mới: "${title}" - ${major}`
    );

    event.target.reset();

}


// ============================================
// 13. POST EXCHANGE BOOK
// ============================================

function handleExchangeSubmit(event) {

    event.preventDefault();

    const title =
        document.getElementById('exTitle').value;

    const condition =
        document.getElementById('exCondition').value;

    const mode =
        document.getElementById('exMode').value;

    const contact =
        document.getElementById('exContact').value;

    const newExchange = {

        id: Date.now(),

        title: title,

        owner: "Bạn (Vừa đăng)",

        major: document.getElementById('selectMajor').value,

        condition: condition,

        mode: mode,

        contact: contact,

        time: "Vừa xong"

    };

    exchangeBooks.unshift(newExchange);

    closeModal('exchangeModal');

    renderExchangeBooks();

    showToast(
        "Đăng bài thành công!",
        "Sách của bạn đã hiển thị trên Chợ trao đổi sách 0đ."
    );

    addLog(
        `[P2P Exchange] Đăng sách mới: "${title}"`
    );

    event.target.reset();

}


// ============================================
// 14. ADD COURSE TAG
// ============================================

function addNewCourseTag() {

    const course = prompt(
        "Nhập tên môn học bạn muốn bổ sung ưu tiên AI:"
    );

    if (course) {

        showToast(
            "Đã thêm môn học",
            `AI sẽ ưu tiên gợi ý các tài liệu môn ${course}.`
        );

        addLog(
            `[Tag Update] Thêm môn học ưu tiên: ${course}`
        );

    }

}


// ============================================
// 15. INITIALIZE FILTER TABS
// ============================================

document.querySelectorAll('.tab-btn').forEach(btn => {

    const type = btn.getAttribute('onclick')
        .match(/filterType\('([^']+)'\)/);

    if (type) {
        btn.dataset.type = type[1];
    }

});
