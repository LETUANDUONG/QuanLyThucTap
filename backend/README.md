# Backend Setup

## 1. Install dependencies

```bash
cd backend
npm install
```

## 2. Create environment file

Copy `.env.example` to `.env` and update your SQL Server information.

For Windows Authentication with `LAPTOP-QG89BGUC\SQLEXPRESS`, you can keep:

```env
DB_AUTH_TYPE=windows
DB_SERVER=LAPTOP-QG89BGUC
DB_INSTANCE=SQLEXPRESS
DB_DATABASE=QuanLyThucTap
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
DB_DRIVER=ODBC Driver 18 for SQL Server
```

If your machine does not have `ODBC Driver 18 for SQL Server`, change `DB_DRIVER`
to the driver name installed on Windows.

## 3. Run backend

```bash
npm run dev
```

Backend will run at `http://localhost:5000`.

## 4. Test APIs

- `GET /api/health`
- `GET /api/db-test`
- `GET /api/db-version`

## 5. Read APIs

- `GET /api/hoc-ky`
- `GET /api/hoc-ky/:id`
- `GET /api/tai-khoan`
- `GET /api/sinh-vien`
- `GET /api/sinh-vien/:id`
- `GET /api/giang-vien`
- `GET /api/giang-vien/:id`
- `GET /api/de-tai`
- `GET /api/de-tai/tong-hop`
- `GET /api/de-tai/:id`
- `GET /api/dang-ky`
- `GET /api/dang-ky/duyet`
- `GET /api/dang-ky/:id`
- `GET /api/bao-cao`
- `GET /api/bao-cao/nop`
- `GET /api/bao-cao/:id`
- `GET /api/thong-bao`
