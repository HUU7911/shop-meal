import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import "../index.css"; // style gốc của footer (logo, cột liên kết, mạng xã hội, footer-bottom...)

type NavLink = { label: string; path: string };

const highlights = [
  { icon: "🚚", title: "Giao hàng nhanh", text: "Nhận món trong 30 – 45 phút" },
  { icon: "🔒", title: "Thanh toán an toàn", text: "Nhiều phương thức, bảo mật thông tin" },
  { icon: "🥗", title: "Nguyên liệu tươi", text: "Chế biến ngay khi nhận đơn" },
  { icon: "💬", title: "Hỗ trợ tận tâm", text: "Giải đáp từ 08:00 đến 22:00 mỗi ngày" },
];

const quickLinks: NavLink[] = [
  { label: "Trang chủ", path: "/" },
  { label: "Thực đơn", path: "/products" },
  { label: "Giỏ hàng", path: "/cart" },
  { label: "Đơn hàng của tôi", path: "/orders" },
  { label: "Đăng nhập", path: "/login" },
];

const supportLinks: NavLink[] = [
  { label: "Hướng dẫn đặt món", path: "/guide" },
  { label: "Phương thức thanh toán", path: "/payment" },
  { label: "Chính sách giao hàng", path: "/shipping" },
  { label: "Chính sách đổi trả & hoàn tiền", path: "/refund" },
  { label: "Câu hỏi thường gặp", path: "/faq" },
  { label: "Liên hệ", path: "/contact" },
];

const orderSteps = [
  { title: "Chọn món", text: "Duyệt thực đơn và thêm món vào giỏ hàng." },
  { title: "Xác nhận đơn", text: "Kiểm tra món, nhập địa chỉ và mã giảm giá." },
  { title: "Thanh toán", text: "Chọn tiền mặt, chuyển khoản hoặc ví điện tử." },
  { title: "Nhận món", text: "Theo dõi đơn hàng và nhận món tại nhà." },
];

const paymentMethods = [
  { name: "Tiền mặt (COD)", note: "Trả khi nhận hàng" },
  { name: "Chuyển khoản", note: "Ngân hàng nội địa" },
  { name: "MoMo", note: "Ví điện tử" },
  { name: "ZaloPay", note: "Ví điện tử" },
  { name: "VNPay", note: "QR & thẻ ATM" },
  { name: "Visa / Mastercard", note: "Thẻ tín dụng, ghi nợ" },
];

const deliveryInfo = [
  { label: "Thời gian giao", value: "30 – 45 phút" },
  { label: "Phí giao hàng", value: "Từ 15.000đ" },
  { label: "Miễn phí giao", value: "Đơn từ 200.000đ" },
  { label: "Phạm vi", value: "Bán kính 10 km" },
];

const legalLinks: NavLink[] = [
  { label: "Điều khoản sử dụng", path: "/terms" },
  { label: "Chính sách bảo mật", path: "/privacy" },
  { label: "Sơ đồ trang", path: "/sitemap" },
];

/* CSS nhúng cho các khối mới. Màu nền và chữ lấy theo .shop-footer của index.css. */
const footerStyles = `
/* Không đặt nền hay màu chữ riêng: mọi màu lấy theo .shop-footer có sẵn.
   Viền, nền ô và chữ phụ được tính từ chính màu chữ của footer. */
.shop-footer {
  --footer-line: color-mix(in srgb, currentColor 22%, transparent);
  --footer-surface: color-mix(in srgb, currentColor 6%, transparent);
  --footer-muted: color-mix(in srgb, currentColor 80%, transparent);
  --footer-accent: #f97316;
}

/* Thanh điểm nổi bật phía trên */
.footer-highlights {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  padding: 40px 0 0;
}
.footer-highlight { display: flex; align-items: center; gap: 12px; }
.footer-highlight-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--footer-surface);
  border: 1px solid var(--footer-line);
  font-size: 20px;
}
.footer-highlight h4 { margin: 0 0 3px; font-size: 15px; font-weight: 600; }
.footer-highlight p { margin: 0; font-size: 13px; line-height: 1.5; color: var(--footer-muted); }

/* Hai khối thông tin song song (tiêu đề h3 dùng style .footer-column có sẵn) */
.footer-info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 40px;
  padding: 40px 0;
  border-top: 1px solid var(--footer-line);
}
.footer-info .footer-info-block h3 { margin-top: 0; }
.footer-note {
  margin: 14px 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--footer-muted);
}

/* Các bước đặt món */
.footer-info .footer-steps {
  display: grid;
  gap: 14px;
  counter-reset: step;
}
.footer-info .footer-steps li {
  display: grid;
  grid-template-columns: 28px 1fr;
  column-gap: 12px;
  row-gap: 2px;
  align-items: start;
  margin-bottom: 0;
  counter-increment: step;
}
.footer-steps li::before {
  content: counter(step);
  grid-row: span 2;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--footer-accent);
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
}
.footer-steps strong { font-size: 14px; font-weight: 600; }
.footer-steps span { font-size: 13px; color: var(--footer-muted); }

/* Thông tin giao hàng */
.footer-delivery {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
}
.footer-delivery div {
  padding: 13px 15px;
  border: 1px solid var(--footer-line);
  border-radius: 10px;
  background: var(--footer-surface);
}
.footer-delivery dt { font-size: 12px; color: var(--footer-muted); }
.footer-delivery dd { margin: 5px 0 0; font-size: 15px; font-weight: 600; }

/* Phương thức thanh toán */
.footer-info .footer-payments {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.footer-info .footer-payments li {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-bottom: 0;
  padding: 11px 13px;
  border: 1px solid var(--footer-line);
  border-radius: 10px;
  background: var(--footer-surface);
}
.footer-payments strong { font-size: 14px; font-weight: 600; }
.footer-payments span { font-size: 12px; color: var(--footer-muted); }

/* Đăng ký nhận tin */
.footer-newsletter { display: flex; gap: 8px; margin-top: 16px; max-width: 460px; }
.footer-newsletter input {
  flex: 1;
  min-width: 0;
  padding: 11px 14px;
  border: 1px solid var(--footer-line);
  border-radius: 10px;
  background: var(--footer-surface);
  color: inherit;
  font: inherit;
}
.footer-newsletter input::placeholder { color: var(--footer-muted); }
.footer-newsletter button {
  padding: 11px 20px;
  border: 0;
  border-radius: 10px;
  background: var(--footer-accent);
  color: #ffffff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}
.footer-newsletter button:hover { background: #ea580c; }
.footer-newsletter input:focus-visible,
.footer-newsletter button:focus-visible {
  outline: 2px solid #fb923c;
  outline-offset: 2px;
}
.footer-subscribed { margin: 16px 0 0; color: var(--footer-accent); font-weight: 600; }

/* Link pháp lý ở dòng cuối (dùng lại .footer-bottom của index.css) */
.footer-legal {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 22px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.footer-legal a { color: inherit; text-decoration: none; transition: color 0.2s ease; }
.footer-legal a:hover { color: #fb923c; }

@media (max-width: 992px) {
  .footer-highlights { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .footer-info { grid-template-columns: 1fr; gap: 35px; }
}
@media (max-width: 576px) {
  .footer-highlights { grid-template-columns: 1fr; padding-top: 30px; }
  .footer-info { padding: 30px 0; }
  .footer-info .footer-payments { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .footer-newsletter { flex-direction: column; max-width: none; }
}
`;

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: gọi API đăng ký nhận tin tại đây
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="shop-footer">
      <style>{footerStyles}</style>

      <div className="footer-container">
        {/* Điểm nổi bật */}
        <div className="footer-highlights">
          {highlights.map((item) => (
            <div className="footer-highlight" key={item.title}>
              <span className="footer-highlight-icon" aria-hidden="true">
                {item.icon}
              </span>
              <div>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Khối chính */}
        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="footer-logo-icon">🍽</span>
              <span>
                Shop <strong>Meal</strong>
              </span>
            </Link>

            <p className="footer-description">
              Khám phá những món ăn ngon mỗi ngày. Đặt món dễ dàng, giao hàng
              nhanh chóng và tận hưởng bữa ăn tuyệt vời cùng Shop Meal.
            </p>

            <div className="footer-socials">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                f
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                ig
              </a>
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
              >
                ▶
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h3>Liên kết nhanh</h3>
            <ul>
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-column">
            <h3>Hỗ trợ khách hàng</h3>
            <ul>
              {supportLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-column footer-contact">
            <h3>Liên hệ với chúng tôi</h3>
            <p>
              <span>✉</span> trihuutran4@gmail.com
            </p>
            <p>
              <span>☎</span> 1900 0000
            </p>
            <p>
              <span>⌖</span> Việt Nam
            </p>
            <p>
              <span>◷</span> 08:00 - 22:00 (cả tuần)
            </p>
          </div>
        </div>

        {/* Cách đặt món + Giao hàng */}
        <div className="footer-info">
          <div className="footer-info-block footer-column">
            <h3>Đặt món trong 4 bước</h3>
            <ol className="footer-steps">
              {orderSteps.map((step) => (
                <li key={step.title}>
                  <strong>{step.title}</strong>
                  <span>{step.text}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="footer-info-block footer-column">
            <h3>Thông tin giao hàng</h3>
            <dl className="footer-delivery">
              {deliveryInfo.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
            <p className="footer-note">
              Đơn hàng được xác nhận qua điện thoại hoặc email. Bạn có thể huỷ
              đơn miễn phí trước khi quán bắt đầu chế biến.
            </p>
          </div>
        </div>

        {/* Thanh toán + Đăng ký nhận tin */}
        <div className="footer-info">
          <div className="footer-info-block footer-column">
            <h3>Phương thức thanh toán</h3>
            <ul className="footer-payments">
              {paymentMethods.map((method) => (
                <li key={method.name}>
                  <strong>{method.name}</strong>
                  <span>{method.note}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-info-block footer-column">
            <h3>Nhận ưu đãi mới nhất</h3>
            <p className="footer-note" style={{ marginTop: 0 }}>
              Đăng ký email để nhận mã giảm giá và thông báo món mới mỗi tuần.
            </p>
            {subscribed ? (
              <p className="footer-subscribed" role="status">
                Đã đăng ký. Cảm ơn bạn đã quan tâm đến Shop Meal!
              </p>
            ) : (
              <form className="footer-newsletter" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email của bạn"
                  aria-label="Email nhận ưu đãi"
                  required
                />
                <button type="submit">Đăng ký</button>
              </form>
            )}
          </div>
        </div>

        {/* Dưới cùng */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Shop Meal. All rights reserved.</p>
          <ul className="footer-legal">
            {legalLinks.map((link) => (
              <li key={link.path}>
                <Link to={link.path}>{link.label}</Link>
              </li>
            ))}
          </ul>
          <p>
            Made with <span className="footer-heart">♥</span> for food lovers
          </p>
        </div>
      </div>
    </footer>
  );
}