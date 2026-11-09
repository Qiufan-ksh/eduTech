const { parse } = require('csv-parse/sync');

const columnMapping = {
    'Câu 1. Bạn đang học năm thứ mấy?': 'Nam_Hoc',
    'Câu 2. Bạn học khoa nào?': 'Khoa',
    'Câu 3. Bạn đang học ngành nào?': 'Nganh_Hoc',
    'Câu 4. Bạn đã học môn nào?': 'Mon_Da_Hoc',
    'Câu 5. Bạn đã từng mua sách/tài liệu học tập phục vụ việc học chưa?': 'Da_Tuong_Mua_Tai_Lieu',
    'Câu 6. Trung bình mỗi học kỳ bạn mua bao nhiêu sách/tài liệu?': 'So_Luong_Mua_Moi_Ky',
    'Câu 7. Bạn thường tìm những loại tài liệu nào?': 'Loai_Tai_Lieu_Tim_Kiem',
    'Câu 8. Bạn thường tìm tài liệu để làm gì?': 'Muc_Dich_Tim_Tai_Lieu',
    'Câu 9. Bạn thường tìm mua/tìm tài liệu học tập ở đâu?': 'Nguon_Tim_Tai_Lieu',
    'Câu 10. Khi lựa chọn một tài liệu, yếu tố nào quan trọng với bạn?': 'Yeu_To_Quan_Trong',
    'Câu 11. Bạn đánh giá mức độ khó khăn khi tìm được tài liệu phù hợp với nhu cầu học tập của mình như thế nào?': 'Muc_Do_Kho_Khan',
    'Câu 12. Bạn thường gặp những khó khăn nào khi tìm tài liệu?': 'Kho_Khan_Khi_Tim',
    'Câu 13. Bạn có nhu cầu sử dụng sách/tài liệu đã qua sử dụng nếu chất lượng còn tốt không?': 'Nhu_Cau_Sach_Cu',
    'Câu 14. Bạn đã từng mua sách/tài liệu học tập đã qua sử dụng chưa?': 'Da_Tuong_Mua_Sach_Cu',
    'Câu 15. Bạn đã từng bán hoặc trao đổi sách/tài liệu sau khi không còn nhu cầu sử dụng chưa?': 'Da_Tuong_Ban_Trao_Doi',
    'Câu 16. Nếu đã từng bán/trao đổi, bạn thường thực hiện thông qua đâu?': 'Kenh_Ban_Trao_Doi',
    'Câu 17. Bạn thường xử lý sách/tài liệu không còn sử dụng như thế nào?': 'Cach_Xu_Ly_Sach_Cu',
    'Bạn có sẵn sàng đăng sách/tài liệu không còn sử dụng lên nền tảng để bán hoặc trao đổi không?': 'San_Sang_Dang_Ban',
    'Câu 25. Những khó khăn bạn thường gặp khi mua sách/tài liệu đã qua sử dụng là gì?': 'Kho_Khan_Mua_Sach_Cu',
    'Những khó khăn khi bạn muốn bán hoặc trao đổi sách/tài liệu là gì?': 'Kho_Khan_Ban_Sach_Cu',
    'Bạn mong muốn nền tảng có những chức năng nào?': 'Chuc_Nang_Mong_Muon',
    'Chức năng nào bạn cho rằng quan trọng nhất?': 'Chuc_Nang_Quan_Trong_Nhat',
    'Bạn muốn hệ thống dựa vào những yếu tố nào để gợi ý tài liệu phù hợp với bạn?': 'Yeu_To_Goi_Y',
    'Bạn muốn website gợi ý tài liệu theo cách nào?': 'Cach_Goi_Y_Mong_Muon',
    'Bạn mong muốn website chia sẻ tài liệu có thêm chức năng gì?': 'Chuc_Nang_Bo_Sung',
    'Câu 35. Bạn có đề xuất hoặc ý kiến nào khác về việc mua bán, tái sử dụng, chia sẻ và trao đổi sách/tài liệu học tập giữa sinh viên?': 'Y_Kien_Dong_Gop'
};

const requiredModeColumns = [
    'Nam_Hoc',
    'Khoa',
    'Nganh_Hoc',
    'Mon_Da_Hoc',
    'Da_Tuong_Mua_Tai_Lieu',
    'So_Luong_Mua_Moi_Ky',
    'Muc_Do_Kho_Khan',
    'Nhu_Cau_Sach_Cu',
    'Da_Tuong_Mua_Sach_Cu',
    'Da_Tuong_Ban_Trao_Doi',
    'San_Sang_Dang_Ban'
];

const multiSelectColumns = [
    'Loai_Tai_Lieu_Tim_Kiem',
    'Muc_Dich_Tim_Tai_Lieu',
    'Nguon_Tim_Tai_Lieu',
    'Yeu_To_Quan_Trong',
    'Kho_Khan_Khi_Tim',
    'Cach_Xu_Ly_Sach_Cu',
    'Kho_Khan_Mua_Sach_Cu',
    'Kho_Khan_Ban_Sach_Cu',
    'Chuc_Nang_Mong_Muon',
    'Chuc_Nang_Quan_Trong_Nhat',
    'Yeu_To_Goi_Y',
    'Cach_Goi_Y_Mong_Muon',
    'Chuc_Nang_Bo_Sung'
];

const numericMappings = [
    {
        source: 'Nam_Hoc',
        target: 'Nam_Hoc_Fix',
        values: { 'Năm 1': '1', 'Năm 2': '2', 'Năm 3': '3', 'Năm 4': '4' }
    },
    {
        source: 'So_Luong_Mua_Moi_Ky',
        target: 'So_Luong_Mua_Fix',
        values: { 'Không mua': '0', '1 - 2': '1', '3 - 5': '2', '6 - 10': '3', 'Trên 10': '4' }
    },
    {
        source: 'Muc_Do_Kho_Khan',
        target: 'Muc_Do_Kho_Khan_Fix',
        values: { 'Dễ': '1', 'Trung bình': '2', 'Khó': '3' }
    }
];

class InvalidSurveyCsvError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidSurveyCsvError';
    }
}

function cleanString(value) {
    if (value === '') {
        return null;
    }

    const cleaned = value.normalize('NFC').replace(/\s+/gu, ' ').trim();
    return cleaned || null;
}

function findMode(values) {
    const counts = new Map();
    for (const value of values) {
        if (value !== null) {
            counts.set(value, (counts.get(value) || 0) + 1);
        }
    }

    return [...counts.entries()]
        .sort(([leftValue, leftCount], [rightValue, rightCount]) =>
            rightCount - leftCount || leftValue.localeCompare(rightValue, 'vi')
        )[0]?.[0] ?? null;
}

function getMappedColumn(header) {
    return Object.hasOwn(columnMapping, header) ? columnMapping[header] : header;
}

function encodeCsvCell(value) {
    const text = value === null || value === undefined ? '' : String(value);
    return /[",\r\n]/u.test(text) ? `"${text.replace(/"/gu, '""')}"` : text;
}

function serializeCsv(columns, rows) {
    const header = columns.map(encodeCsvCell).join(',');
    const records = rows.map((row) => columns.map((column) => encodeCsvCell(row[column])).join(','));
    return `\uFEFF${[header, ...records].join('\r\n')}\r\n`;
}

function preprocessSurveyCsv(csvText) {
    let records;
    try {
        records = parse(csvText, {
            bom: true,
            skip_empty_lines: true,
            max_record_size: 100000
        });
    } catch (error) {
        if (error.code?.startsWith('CSV_')) {
            throw new InvalidSurveyCsvError('Tệp CSV không đúng định dạng hoặc có số cột không nhất quán.');
        }
        throw error;
    }

    if (records.length < 2 || records[0].length === 0) {
        throw new InvalidSurveyCsvError('CSV phải có hàng tiêu đề và ít nhất một dòng dữ liệu.');
    }

    const headers = records[0].map((header) => header.trim());
    if (headers.some((header) => !header)) {
        throw new InvalidSurveyCsvError('CSV không được chứa tên cột trống.');
    }
    if (new Set(headers).size !== headers.length) {
        throw new InvalidSurveyCsvError('CSV chứa tên cột trùng lặp sau khi loại bỏ khoảng trắng.');
    }

    const retainedHeaders = headers.filter((header) => header !== 'Dấu thời gian');
    const recognizedSurveyColumn = retainedHeaders.some((header) => Object.hasOwn(columnMapping, header));
    if (!recognizedSurveyColumn) {
        throw new InvalidSurveyCsvError('Không tìm thấy cột khảo sát được hỗ trợ trong CSV.');
    }

    let columns = retainedHeaders.map(getMappedColumn);
    if (new Set(columns).size !== columns.length) {
        throw new InvalidSurveyCsvError('Các cột sau khi đổi tên bị trùng lặp.');
    }

    const retainedIndexes = headers
        .map((header, index) => header === 'Dấu thời gian' ? -1 : index)
        .filter((index) => index >= 0);
    const rows = records.slice(1).map((record) => {
        const row = Object.create(null);
        retainedIndexes.forEach((sourceIndex, columnIndex) => {
            row[columns[columnIndex]] = cleanString(record[sourceIndex]);
        });

        if (row.Nganh_Hoc) {
            row.Nganh_Hoc = row.Nganh_Hoc.replace(/Kĩ/gu, 'Kỹ');
        }
        return row;
    });

    if (columns.includes('Kenh_Ban_Trao_Doi')) {
        for (const row of rows) {
            row.Kenh_Ban_Trao_Doi ??= 'Không áp dụng';
        }
    }

    for (const column of ['Kho_Khan_Ban_Sach_Cu', 'Kho_Khan_Mua_Sach_Cu', 'Kho_Khan_Khi_Tim']) {
        if (columns.includes(column)) {
            for (const row of rows) {
                row[column] ??= 'Không gặp khó khăn';
            }
        }
    }

    for (const column of ['Y_Kien_Dong_Gop', 'Cach_Goi_Y_Mong_Muon', 'Chuc_Nang_Bo_Sung']) {
        if (columns.includes(column)) {
            for (const row of rows) {
                row[column] ??= 'Không có ý kiến';
            }
        }
    }

    for (const column of requiredModeColumns) {
        if (columns.includes(column)) {
            const mode = findMode(rows.map((row) => row[column]));
            if (mode !== null) {
                for (const row of rows) {
                    row[column] ??= mode;
                }
            }
        }
    }

    for (const { source, target, values } of numericMappings) {
        if (columns.includes(source)) {
            if (columns.includes(target)) {
                throw new InvalidSurveyCsvError(`CSV đã chứa cột được tạo tự động "${target}".`);
            }
            columns.push(target);
            for (const row of rows) {
                row[target] = Object.hasOwn(values, row[source]) ? values[row[source]] : null;
            }
        }
    }

    for (const column of multiSelectColumns) {
        if (!columns.includes(column)) {
            continue;
        }

        const separator = rows.some((row) => row[column]?.includes(';')) ? ';' : ',';
        const categories = new Set();
        for (const row of rows) {
            if (row[column] === null) {
                continue;
            }
            const normalized = row[column].replaceAll(`${separator} `, separator);
            row[column] = normalized.split(separator);
            for (const category of row[column]) {
                if (category) {
                    categories.add(category);
                }
            }
        }

        const dummyColumns = [...categories]
            .sort((left, right) => left.localeCompare(right, 'vi'))
            .map((category) => `${column}_${category}`);
        if (dummyColumns.some((dummyColumn) => columns.includes(dummyColumn))) {
            throw new InvalidSurveyCsvError('Tên cột mã hóa câu trả lời bị trùng với cột dữ liệu khác.');
        }

        columns = columns.filter((existingColumn) => existingColumn !== column);
        columns.push(...dummyColumns);
        for (const row of rows) {
            const selected = new Set(Array.isArray(row[column]) ? row[column] : []);
            delete row[column];
            for (const dummyColumn of dummyColumns) {
                row[dummyColumn] = selected.has(dummyColumn.slice(column.length + 1)) ? '1' : '0';
            }
        }
    }

    return serializeCsv(columns, rows);
}

module.exports = { InvalidSurveyCsvError, preprocessSurveyCsv };
