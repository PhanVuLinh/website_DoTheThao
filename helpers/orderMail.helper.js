const nodemailer = require("nodemailer");
const moment = require("moment");
const SettingWebsiteInfo = require("../models/setting-website-info.model");

const formatPriceVND = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price || 0);
};

module.exports.sendOrderConfirmationEmail = async (order, productsInfo = []) => {
  try {
    if (!order || !order.email) {
      console.warn("sendOrderConfirmationEmail: Không có email để gửi hóa đơn.");
      return;
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn("sendOrderConfirmationEmail: EMAIL_USER hoặc EMAIL_PASSWORD chưa được cấu hình.");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Tạo các dòng sản phẩm trong bảng HTML
    const productRowsHtml = productsInfo
      .map((item) => {
        const itemTotal = (item.priceNew || item.price || 0) * (item.quantity || 1);
        return `
        <tr>
          <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; text-align: left; vertical-align: middle;">
            <div style="font-weight: 600; color: #1e293b; font-size: 14px;">${item.title || "Sản phẩm"}</div>
            ${item.size ? `<span style="display: inline-block; font-size: 12px; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 4px; margin-top: 4px;">Size: <strong>${item.size}</strong></span>` : ""}
          </td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #334155; font-size: 14px; vertical-align: middle;">
            ${item.quantity}
          </td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #334155; font-size: 14px; vertical-align: middle;">
            ${formatPriceVND(item.priceNew || item.price)}
          </td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 700; color: #e11d48; font-size: 14px; vertical-align: middle;">
            ${formatPriceVND(itemTotal)}
          </td>
        </tr>
      `;
      })
      .join("");

    const orderTime = moment(order.createdAt || new Date()).format("HH:mm - DD/MM/YYYY");
    const domain = process.env.DOMAIN_WEBSITE || "http://localhost:3000";

    let bankInfoHtml = "";
    if (order.paymentMethod === "bank") {
      const setting = await SettingWebsiteInfo.findOne({});
      const bankName = setting?.bankName || "Vietcombank";
      const bankAcc = setting?.bankAccountNumber || "1029384756";
      const bankNameAcc = setting?.bankAccountName || "TITISPORT STORE";
      bankInfoHtml = `
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px; margin-top: 12px;">
          <p style="margin: 0 0 6px; font-weight: 700; color: #1e40af; font-size: 13px;">HƯỚNG DẪN CHUYỂN KHOẢN THANH TOÁN:</p>
          <p style="margin: 0 0 4px; font-size: 13px;">Ngân hàng thụ hưởng: <strong>${bankName}</strong></p>
          <p style="margin: 0 0 4px; font-size: 13px;">Số tài khoản: <strong style="color: #2563eb; font-size: 14px;">${bankAcc}</strong></p>
          <p style="margin: 0 0 4px; font-size: 13px;">Chủ tài khoản: <strong>${bankNameAcc}</strong></p>
          <p style="margin: 0 0 4px; font-size: 13px;">Số tiền: <strong style="color: #e11d48; font-size: 14px;">${formatPriceVND(order.total)}</strong></p>
          <p style="margin: 0; font-size: 13px;">Nội dung chuyển khoản: <strong style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; color: #0f172a;">${order.orderCode}</strong></p>
        </div>
      `;
    }

    const emailHtml = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Xác nhận đơn hàng #${order.orderCode}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
      <div style="max-width: 650px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #e11d48 100%); padding: 36px 30px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase;">SPORT STORE</h1>
          <p style="margin: 8px 0 0; font-size: 14px; color: #fda4af; font-weight: 500;">Cảm ơn bạn đã lựa chọn mua sắm cùng chúng tôi!</p>
        </div>

        <div style="padding: 32px 30px;">
          <!-- Notification Status -->
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px; text-align: center;">
            <div style="font-size: 18px; font-weight: 700; color: #166534; margin-bottom: 4px;">🎉 Đặt hàng thành công!</div>
            <div style="font-size: 14px; color: #15803d;">Mã đơn hàng: <strong style="color: #0f172a; font-family: monospace; font-size: 15px;">#${order.orderCode}</strong></div>
            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Thời gian đặt: ${orderTime}</div>
          </div>

          <!-- Thông tin giao hàng -->
          <h3 style="margin: 0 0 14px; font-size: 16px; font-weight: 700; color: #0f172a; text-transform: uppercase; border-left: 4px solid #e11d48; padding-left: 10px;">
            Thông tin người nhận
          </h3>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 28px; font-size: 14px;">
            <p style="margin: 0 0 8px;"><strong>Họ và tên:</strong> ${order.fullName}</p>
            <p style="margin: 0 0 8px;"><strong>Số điện thoại:</strong> ${order.phone}</p>
            <p style="margin: 0 0 8px;"><strong>Địa chỉ giao:</strong> ${order.address}</p>
            ${order.note ? `<p style="margin: 0 0 8px;"><strong>Ghi chú:</strong> <em style="color: #64748b;">${order.note}</em></p>` : ""}
            <p style="margin: 0;"><strong>Phương thức thanh toán:</strong> <span style="font-weight: 600; color: #2563eb;">${order.paymentMethodName || order.paymentMethod?.toUpperCase()}</span></p>
            ${bankInfoHtml}
          </div>

          <!-- Chi tiết sản phẩm -->
          <h3 style="margin: 0 0 14px; font-size: 16px; font-weight: 700; color: #0f172a; text-transform: uppercase; border-left: 4px solid #e11d48; padding-left: 10px;">
            Chi tiết đơn hàng
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="background: #f1f5f9; border-bottom: 2px solid #e2e8f0;">
                <th style="padding: 10px; text-align: left; font-size: 13px; color: #475569; font-weight: 600;">Sản phẩm</th>
                <th style="padding: 10px; text-align: center; font-size: 13px; color: #475569; font-weight: 600;">SL</th>
                <th style="padding: 10px; text-align: right; font-size: 13px; color: #475569; font-weight: 600;">Đơn giá</th>
                <th style="padding: 10px; text-align: right; font-size: 13px; color: #475569; font-weight: 600;">Tổng</th>
              </tr>
            </thead>
            <tbody>
              ${productRowsHtml}
            </tbody>
          </table>

          <!-- Tổng kết giá trị -->
          <div style="background: #f8fafc; border-radius: 12px; padding: 18px 20px; border: 1px solid #e2e8f0; margin-bottom: 28px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #64748b;">
              <span>Tạm tính:</span>
              <strong style="color: #1e293b;">${formatPriceVND(order.subtotal)}</strong>
            </div>
            ${
              order.discount > 0
                ? `<div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #16a34a;">
                    <span>Giảm giá khuyến mãi (${order.couponCode || "Voucher"}):</span>
                    <strong>-${formatPriceVND(order.discount)}</strong>
                  </div>`
                : ""
            }
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #64748b;">
              <span>Phí vận chuyển:</span>
              <strong style="color: #16a34a;">Miễn phí toàn quốc</strong>
            </div>
            <div style="border-top: 2px dashed #cbd5e1; margin-top: 10px; padding-top: 12px; display: flex; justify-content: space-between; font-size: 17px; font-weight: 800; color: #0f172a;">
              <span>TỔNG THANH TOÁN:</span>
              <span style="color: #e11d48;">${formatPriceVND(order.total)}</span>
            </div>
          </div>

          <!-- Nút tra cứu đơn hàng -->
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${domain}/order/success/${order._id || order.id}" style="display: inline-block; background: #e11d48; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 15px rgba(225, 29, 72, 0.35);">
              Xem Chi Tiết Đơn Hàng Tại Website
            </a>
          </div>

          <!-- Trợ giúp -->
          <p style="margin: 0; font-size: 13px; color: #64748b; text-align: center;">
            Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ hotline hỗ trợ 24/7 của chúng tôi hoặc phản hồi trực tiếp qua email này.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #0f172a; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0 0 4px;">&copy; ${new Date().getFullYear()} SportStore. Bản quyền thuộc về Hệ thống Đồ thể thao chuyên nghiệp.</p>
          <p style="margin: 0;">Email tự động gửi từ hệ thống - Vui lòng không gửi thông tin thẻ ngân hàng qua email.</p>
        </div>

      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: `"SportStore Vietnam" <${process.env.EMAIL_USER}>`,
      to: order.email,
      subject: `[SportStore] Xác nhận đơn hàng #${order.orderCode} - Đặt hàng thành công`,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Order Email] Hóa đơn đã gửi thành công tới ${order.email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("[Order Email] Lỗi gửi email hóa đơn:", error.message);
  }
};
