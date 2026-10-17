# Vanilla Enterprise Shop

یک پروژهٔ آموزشی برای یادگیری معماری حرفه‌ای فرانت‌اند با HTML/CSS/JavaScript خالص.

## معماری
- Core: EventBus + Store(Proxy) + Router
- Services: Auth/Product/Order/Article/Feedback روی StorageService
- Views: کامپوننت‌های قابل استفاده مجدد + صفحات SPA

## اجرا
```bash
npm install
npm run lint:js
npm run typecheck
```

`index.html` را با یک static server باز کنید.
