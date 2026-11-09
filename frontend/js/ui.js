
// ================================
// UI FUNCTIONS
// ================================


// Hiển thị modal
function openModal(id) {
    document.getElementById(id)
        .classList.remove('hidden');
}


// Đóng modal
function closeModal(id) {
    document.getElementById(id)
        .classList.add('hidden');
}


// Hiển thị thông báo
function showToast(title, msg) {
    const toast = document.getElementById('toast');

    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastMsg').textContent = msg;

    toast.classList.remove(
        'translate-y-20',
        'opacity-0'
    );

    toast.classList.add(
        'translate-y-0',
        'opacity-100'
    );

    setTimeout(() => {
        toast.classList.remove(
            'translate-y-0',
            'opacity-100'
        );

        toast.classList.add(
            'translate-y-20',
            'opacity-0'
        );

    }, 3000);
}


// Thêm nhật ký tương tác
function addLog(message) {
    const consoleBox = document.getElementById('logConsole');

    const time = new Date().toLocaleTimeString();

    const logItem = document.createElement('div');

    logItem.className =
        'text-slate-300 py-0.5 border-b border-slate-800/40';

    const timeElement = document.createElement('span');

    timeElement.className = 'text-cyan-400';
    timeElement.textContent = `[${time}] `;

    const messageElement = document.createElement('span');

    messageElement.textContent = message;

    logItem.append(timeElement, messageElement);

    consoleBox.prepend(logItem);
}


// Xóa nhật ký
function clearLogs() {
    document.getElementById('logConsole').innerHTML =
        '<div class="text-slate-500">// Đã xóa nhật ký tương tác.</div>';
}


// Hiển thị danh sách tài liệu
function renderDocuments() {
    const grid = document.getElementById('documentGrid');

    const searchVal = document
        .getElementById('searchInput')
        .value.toLowerCase();

    let processedDocs = documents.map(doc => ({
        ...doc,
        calculatedScore: calculateMatchScore(doc)
    }));

    processedDocs.sort(
        (a, b) => b.calculatedScore - a.calculatedScore
    );

    let filteredDocs = processedDocs.filter(doc => {
        const matchesType =
            currentFilterType === 'all' ||
            doc.type === currentFilterType;

        const matchesSearch =
            doc.title.toLowerCase().includes(searchVal) ||
            doc.subject.toLowerCase().includes(searchVal) ||
            doc.major.toLowerCase().includes(searchVal);

        return matchesType && matchesSearch;
    });

    if (filteredDocs.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-12 text-center text-slate-400 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                <i data-lucide="file-search" class="w-10 h-10 mx-auto text-slate-500 mb-2"></i>
                <p class="font-semibold text-sm">Không tìm thấy tài liệu phù hợp</p>
                <p class="text-xs text-slate-500 mt-1">
                    Thử đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc AI.
                </p>
            </div>
        `;

        lucide.createIcons();
        return;
    }

    grid.innerHTML = filteredDocs.map(doc => `
        <div class="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-brand-500/50 transition-all duration-300 hover:shadow-brand-500/10 group light:bg-white light:border-slate-200">

            <div>
                <div class="flex items-start justify-between gap-2 mb-3">

                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        doc.calculatedScore >= 85
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                    }">
                        <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                        ${doc.calculatedScore}% Phù hợp
                    </span>

                    <div class="flex items-center gap-1">

                        <span class="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-slate-700 text-slate-300">
                            ${doc.major}
                        </span>

                        <button onclick="toggleBookmark(${doc.id})"
                            title="Lưu tài liệu"
                            class="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-700/50 transition-all">

                            <i data-lucide="bookmark"
                                class="w-4 h-4 ${
                                    doc.bookmarked
                                        ? 'text-amber-400 fill-amber-400'
                                        : ''
                                }"></i>
                        </button>

                    </div>
                </div>

                <h3 class="font-bold text-sm text-slate-100 group-hover:text-brand-400 transition-colors line-clamp-2 mb-1.5">
                    ${doc.title}
                </h3>

                <p class="text-xs text-slate-400 flex items-center gap-1.5 mb-2">
                    <i data-lucide="book" class="w-3.5 h-3.5 text-cyan-400"></i>
                    Môn:
                    <strong class="text-slate-300">${doc.subject}</strong>
                </p>

                <div class="bg-slate-900/80 border border-slate-700/60 rounded-xl p-2.5 mb-3 text-[11px] text-slate-300">
                    <p class="flex items-start gap-1.5">
                        <i data-lucide="info" class="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5"></i>
                        <span>${doc.aiReason}</span>
                    </p>
                </div>
            </div>

            <div>
                <div class="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-700/60 pt-3 mb-3">

                    <span class="flex items-center gap-1">
                        <i data-lucide="download" class="w-3.5 h-3.5"></i>
                        ${doc.downloads} lượt tải
                    </span>

                    <span class="flex items-center gap-1 text-amber-400 font-semibold">
                        <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400"></i>
                        ${doc.rating}
                    </span>

                    <span>${doc.format}</span>
                </div>

                <div class="grid grid-cols-2 gap-2">

                    <button onclick="handleAction('like', ${doc.id})"
                        class="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-300 hover:text-rose-400 text-xs font-medium transition-all flex items-center justify-center gap-1.5">

                        <i data-lucide="heart" class="w-3.5 h-3.5"></i>
                        <span>${doc.likes}</span>
                    </button>

                    <button onclick="handleAction('download', ${doc.id})"
                        class="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-all flex items-center justify-center gap-1.5">

                        <i data-lucide="arrow-down-to-line" class="w-3.5 h-3.5"></i>
                        Tải về ngay
                    </button>

                </div>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}


// Hiển thị sách trao đổi
function renderExchangeBooks() {
    const grid = document.getElementById('exchangeGrid');

    grid.innerHTML = exchangeBooks.map(book => `
        <div class="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-md flex flex-col justify-between hover:border-emerald-500/50 transition-all">

            <div>
                <div class="flex items-center justify-between mb-2">

                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ${book.mode}
                    </span>

                    <span class="text-[10px] text-slate-400">
                        ${book.time}
                    </span>

                </div>

                <h4 class="font-bold text-xs text-slate-100 mb-1 line-clamp-2">
                    ${book.title}
                </h4>

                <p class="text-[11px] text-slate-400 mb-1">
                    Người đăng:
                    <span class="text-slate-300">${book.owner}</span>
                </p>

                <p class="text-[11px] text-slate-400 mb-2">
                    Tình trạng:
                    <span class="text-amber-400">${book.condition}</span>
                </p>
            </div>

            <div class="border-t border-slate-700/60 pt-2.5 mt-2">

                <p class="text-[10px] text-slate-400 truncate mb-2">
                    Liên hệ: ${book.contact}
                </p>

                <button onclick="requestExchange(${JSON.stringify(book.title)}, ${JSON.stringify(book.owner)})"
                    class="w-full py-1.5 bg-slate-700 hover:bg-emerald-600 hover:text-white text-slate-200 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1">

                    <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
                    Nhắn tin xin đổi sách
                </button>

            </div>
        </div>
    `).join('');

    lucide.createIcons();
}
