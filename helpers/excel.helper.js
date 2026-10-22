const ExcelJS = require("exceljs");
const moment = require("moment");

/**
 * 🎨 EXCEL STYLING PALETTE & CONFIGURATION
 * Chuẩn màu sắc, font chữ Segoe UI/Calibri hỗ trợ Unicode tiếng Việt 100%,
 * tự động căn lề, border và tự tính toán độ rộng cột (Auto-fit Width).
 */
const COLORS = {
  headerFill: "1E3A8A", // Xanh navy đậm sang trọng
  headerFont: "FFFFFF", // Chữ trắng
  subHeaderFill: "2563EB", // Xanh dương tươi sáng
  zebraEven: "F8FAFC", // Màu xen kẽ dòng chẵn
  zebraOdd: "FFFFFF", // Màu dòng lẻ
  totalFill: "EFF6FF", // Màu hàng tổng kết
  borderColor: "CBD5E1", // Đường viền mỏng xám nhạt
  brandColor: "1E40AF",
};

/**
 * Khởi tạo Workbook chuẩn với metadata
 */
function createWorkbook() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TitiSport Admin Management System";
  workbook.lastModifiedBy = "TitiSport Admin";
  workbook.created = new Date();
  workbook.modified = new Date();
  return workbook;
}

/**
 * Thêm Banner đầu trang chuyên nghiệp (Tên thương hiệu, Tên báo cáo, Thời gian, Người xuất)
 */
function addHeaderBanner(worksheet, options = {}) {
  const {
    title = "BÁO CÁO THỐNG KÊ DOANH THU",
    subtitle = "HỆ THỐNG QUẢN LÝ CỬA HÀNG THỂ THAO TITISPORT STORE",
    meta = [],
  } = options;

  // Dòng 1: Tên hệ thống / Thương hiệu
  const brandRow = worksheet.addRow([subtitle]);
  brandRow.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "64748B" } };
  brandRow.alignment = { vertical: "middle", horizontal: "left" };
  brandRow.height = 20;

  // Dòng 2: Tiêu đề báo cáo chính
  const titleRow = worksheet.addRow([title.toUpperCase()]);
  titleRow.font = { name: "Segoe UI", size: 16, bold: true, color: { argb: COLORS.headerFill } };
  titleRow.alignment = { vertical: "middle", horizontal: "left" };
  titleRow.height = 32;

  // Dòng Meta thông tin bổ trợ (Thời gian xuất, Kỳ báo cáo, v.v.)
  meta.forEach((item) => {
    const metaRow = worksheet.addRow([item.label + ": " + item.value]);
    metaRow.font = { name: "Segoe UI", size: 9.5, italic: true, color: { argb: "475569" } };
    metaRow.alignment = { vertical: "middle", horizontal: "left" };
    metaRow.height = 18;
  });

  // Dòng trống phân cách
  const emptyRow = worksheet.addRow([]);
  emptyRow.height = 10;
}

/**
 * Định dạng bảng dữ liệu: Header, Cell Borders, Number Formats, Alignment, Auto Column Widths
 */
function formatTable(worksheet, options = {}) {
  const {
    headerRowIndex,
    dataStartRowIndex,
    dataEndRowIndex,
    columns = [],
    hasTotalRow = false,
  } = options;

  const thinBorder = {
    top: { style: "thin", color: { argb: COLORS.borderColor } },
    left: { style: "thin", color: { argb: COLORS.borderColor } },
    bottom: { style: "thin", color: { argb: COLORS.borderColor } },
    right: { style: "thin", color: { argb: COLORS.borderColor } },
  };

  const doubleBottomBorder = {
    top: { style: "thin", color: { argb: COLORS.headerFill } },
    left: { style: "thin", color: { argb: COLORS.borderColor } },
    bottom: { style: "double", color: { argb: COLORS.headerFill } },
    right: { style: "thin", color: { argb: COLORS.borderColor } },
  };

  // 1. Format Header Row
  const headerRow = worksheet.getRow(headerRowIndex);
  headerRow.height = 28;
  headerRow.eachCell((cell, colNumber) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.headerFill },
    };
    cell.font = {
      name: "Segoe UI",
      size: 10.5,
      bold: true,
      color: { argb: COLORS.headerFont },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: columns[colNumber - 1]?.align || "center",
      wrapText: true,
    };
    cell.border = thinBorder;
  });

  // 2. Format Data Rows
  for (let r = dataStartRowIndex; r <= dataEndRowIndex; r++) {
    const row = worksheet.getRow(r);
    const isEven = (r - dataStartRowIndex) % 2 === 0;
    row.height = row.height || 22;

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const colDef = columns[colNumber - 1] || {};

      // Fill màu xen kẽ dịu mắt
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: isEven ? COLORS.zebraOdd : COLORS.zebraEven },
      };

      cell.font = {
        name: "Segoe UI",
        size: 10,
        color: { argb: "1E293B" },
      };

      cell.alignment = {
        vertical: "middle",
        horizontal: colDef.align || "left",
        wrapText: Boolean(colDef.wrapText),
      };

      cell.border = thinBorder;

      // Áp dụng định dạng số hoặc tiền tệ
      if (colDef.numFmt) {
        cell.numFmt = colDef.numFmt;
      }
    });
  }

  // 3. Format Total Row nếu có
  if (hasTotalRow && dataEndRowIndex >= dataStartRowIndex) {
    const totalRow = worksheet.getRow(dataEndRowIndex + 1);
    totalRow.height = 26;
    totalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const colDef = columns[colNumber - 1] || {};
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLORS.totalFill },
      };
      cell.font = {
        name: "Segoe UI",
        size: 10.5,
        bold: true,
        color: { argb: COLORS.headerFill },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: colDef.align || "right",
      };
      cell.border = doubleBottomBorder;

      if (colDef.numFmt) {
        cell.numFmt = colDef.numFmt;
      }
    });
  }

  // 4. Auto-Fit Column Widths (Tránh rớt chữ, tràn lề)
  autoFitColumns(worksheet, columns, { headerRowIndex, dataEndRowIndex });
}

/**
 * Tự động tính toán bề rộng cột thông minh dựa trên độ dài nội dung bảng
 */
function autoFitColumns(worksheet, columnDefs = [], options = {}) {
  const { headerRowIndex = 1, dataEndRowIndex = worksheet.rowCount } = options;

  worksheet.columns.forEach((column, colIdx) => {
    const def = columnDefs[colIdx] || {};

    if (def.width) {
      column.width = def.width;
      return;
    }

    let maxLength = (def.header || "").length || 10;

    column.eachCell({ includeEmpty: false }, (cell, rowIdx) => {
      // Chỉ tính toán từ dòng Header đến dòng dữ liệu cuối, bỏ qua banner và dòng tổng kết merge
      if (rowIdx < headerRowIndex || rowIdx > dataEndRowIndex) return;
      if (cell.isMerged) return;

      let cellValue = cell.value;
      if (cellValue === null || cellValue === undefined) return;

      let textLen = 0;
      if (typeof cellValue === "object") {
        if (cellValue.text) textLen = String(cellValue.text).length;
        else if (cellValue.result) textLen = String(cellValue.result).length;
        else textLen = String(cellValue).length;
      } else {
        textLen = String(cellValue).length;
      }

      // Thêm bù trừ cho số tiền có định dạng dấu phẩy và chữ đ
      if (def.numFmt && typeof cellValue === "number") {
        textLen += 6;
      }

      // Nếu có xuống dòng nhiều dòng (\n), lấy dòng dài nhất
      if (String(cellValue).includes("\n")) {
        const lines = String(cellValue).split("\n");
        textLen = Math.max(...lines.map((l) => l.length));
      }

      if (textLen > maxLength) {
        maxLength = textLen;
      }
    });

    // Căn cứ minWidth và maxWidth để giới hạn độ rộng lý tưởng
    const minW = def.minWidth || 12;
    const maxW = def.maxWidth || 60;
    const calculatedWidth = Math.min(Math.max(maxLength + 4, minW), maxW);
    column.width = calculatedWidth;
  });
}

/**
 * Gửi workbook trực tiếp về trình duyệt để tải xuống file .xlsx
 */
async function sendWorkbook(res, workbook, filename) {
  const encodedFilename = encodeURIComponent(filename).replace(/['()]/g, escape);
  
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`
  );
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  await workbook.xlsx.write(res);
  res.end();
}

module.exports = {
  createWorkbook,
  addHeaderBanner,
  formatTable,
  autoFitColumns,
  sendWorkbook,
  COLORS,
};
