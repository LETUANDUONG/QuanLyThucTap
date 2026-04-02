/*
  Script khoi tao database cho he thong Quan Ly De Tai Thuc Tap
  Phu hop voi cac module frontend hien co:
  - Dang nhap / doi mat khau
  - Quan ly hoc ky
  - Quan ly sinh vien / giang vien / admin
  - Quan ly de tai
  - Dang ky va duyet de tai
  - Quan ly dot bao cao va nop bao cao
  - Thong bao

  Cach chay:
  1. Mo SQL Server Management Studio
  2. Ket noi toi LAPTOP-QG89BGUC\SQLEXPRESS bang Windows Authentication
  3. Mo file nay va Execute
*/

USE master;
GO

IF DB_ID(N'QuanLyThucTap') IS NULL
BEGIN
    CREATE DATABASE QuanLyThucTap;
END
GO

USE QuanLyThucTap;
GO

/* Xoa bang cu neu muon chay lai script */
IF OBJECT_ID(N'dbo.ThongBao', N'U') IS NOT NULL DROP TABLE dbo.ThongBao;
IF OBJECT_ID(N'dbo.NopBaoCao', N'U') IS NOT NULL DROP TABLE dbo.NopBaoCao;
IF OBJECT_ID(N'dbo.DotBaoCao', N'U') IS NOT NULL DROP TABLE dbo.DotBaoCao;
IF OBJECT_ID(N'dbo.DangKyDeTai', N'U') IS NOT NULL DROP TABLE dbo.DangKyDeTai;
IF OBJECT_ID(N'dbo.DeTai', N'U') IS NOT NULL DROP TABLE dbo.DeTai;
IF OBJECT_ID(N'dbo.SinhVien', N'U') IS NOT NULL DROP TABLE dbo.SinhVien;
IF OBJECT_ID(N'dbo.GiangVien', N'U') IS NOT NULL DROP TABLE dbo.GiangVien;
IF OBJECT_ID(N'dbo.TaiKhoan', N'U') IS NOT NULL DROP TABLE dbo.TaiKhoan;
IF OBJECT_ID(N'dbo.HocKy', N'U') IS NOT NULL DROP TABLE dbo.HocKy;
GO

CREATE TABLE dbo.HocKy
(
    MaHocKy VARCHAR(20) NOT NULL PRIMARY KEY,
    TenHocKy NVARCHAR(100) NOT NULL,
    NgayBatDau DATE NOT NULL,
    NgayKetThuc DATE NOT NULL,
    TrangThai VARCHAR(20) NOT NULL
        CONSTRAINT CK_HocKy_TrangThai CHECK (TrangThai IN ('OPEN', 'CLOSED')),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

CREATE TABLE dbo.TaiKhoan
(
    MaTaiKhoan INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    TenDangNhap VARCHAR(50) NOT NULL UNIQUE,
    MatKhauHash NVARCHAR(255) NOT NULL,
    VaiTro VARCHAR(20) NOT NULL
        CONSTRAINT CK_TaiKhoan_VaiTro CHECK (VaiTro IN ('ADMIN', 'TEACHER', 'STUDENT')),
    TrangThai VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CONSTRAINT CK_TaiKhoan_TrangThai CHECK (TrangThai IN ('ACTIVE', 'LOCKED')),
    LanDangNhapCuoi DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

CREATE TABLE dbo.GiangVien
(
    MaGiangVien VARCHAR(20) NOT NULL PRIMARY KEY,
    MaTaiKhoan INT NOT NULL UNIQUE,
    HoTen NVARCHAR(100) NOT NULL,
    BoMon NVARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    SoDienThoai VARCHAR(20) NULL,
    TrangThai VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CONSTRAINT CK_GiangVien_TrangThai CHECK (TrangThai IN ('ACTIVE', 'LOCKED')),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_GiangVien_TaiKhoan FOREIGN KEY (MaTaiKhoan) REFERENCES dbo.TaiKhoan(MaTaiKhoan)
);
GO

CREATE TABLE dbo.SinhVien
(
    MaSinhVien VARCHAR(20) NOT NULL PRIMARY KEY,
    MaTaiKhoan INT NOT NULL UNIQUE,
    HoTen NVARCHAR(100) NOT NULL,
    Lop NVARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    SoDienThoai VARCHAR(20) NULL,
    NamHoc SMALLINT NULL,
    TrangThai VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CONSTRAINT CK_SinhVien_TrangThai CHECK (TrangThai IN ('ACTIVE', 'LOCKED')),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_SinhVien_TaiKhoan FOREIGN KEY (MaTaiKhoan) REFERENCES dbo.TaiKhoan(MaTaiKhoan)
);
GO

CREATE TABLE dbo.DeTai
(
    MaDeTai VARCHAR(20) NOT NULL PRIMARY KEY,
    MaHocKy VARCHAR(20) NOT NULL,
    MaGiangVien VARCHAR(20) NOT NULL,
    TenDeTai NVARCHAR(200) NOT NULL,
    MoTa NVARCHAR(MAX) NULL,
    SoLuongToiDa INT NOT NULL DEFAULT 1,
    TrangThai VARCHAR(20) NOT NULL DEFAULT 'OPEN'
        CONSTRAINT CK_DeTai_TrangThai CHECK (TrangThai IN ('OPEN', 'CLOSED')),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT CK_DeTai_SoLuongToiDa CHECK (SoLuongToiDa > 0),
    CONSTRAINT FK_DeTai_HocKy FOREIGN KEY (MaHocKy) REFERENCES dbo.HocKy(MaHocKy),
    CONSTRAINT FK_DeTai_GiangVien FOREIGN KEY (MaGiangVien) REFERENCES dbo.GiangVien(MaGiangVien)
);
GO

CREATE TABLE dbo.DangKyDeTai
(
    MaDangKy VARCHAR(20) NOT NULL PRIMARY KEY,
    MaSinhVien VARCHAR(20) NOT NULL,
    MaDeTai VARCHAR(20) NOT NULL,
    NgayDangKy DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    TrangThai VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CONSTRAINT CK_DangKyDeTai_TrangThai CHECK (TrangThai IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    LyDoTuChoi NVARCHAR(500) NULL,
    NgayDuyet DATETIME2 NULL,
    NguoiDuyet VARCHAR(20) NULL,
    CONSTRAINT UQ_DangKyDeTai_SinhVien_DeTai UNIQUE (MaSinhVien, MaDeTai),
    CONSTRAINT FK_DangKyDeTai_SinhVien FOREIGN KEY (MaSinhVien) REFERENCES dbo.SinhVien(MaSinhVien),
    CONSTRAINT FK_DangKyDeTai_DeTai FOREIGN KEY (MaDeTai) REFERENCES dbo.DeTai(MaDeTai),
    CONSTRAINT FK_DangKyDeTai_GiangVienDuyet FOREIGN KEY (NguoiDuyet) REFERENCES dbo.GiangVien(MaGiangVien)
);
GO

CREATE TABLE dbo.DotBaoCao
(
    MaBaoCao VARCHAR(20) NOT NULL PRIMARY KEY,
    MaHocKy VARCHAR(20) NOT NULL,
    TenBaoCao NVARCHAR(200) NOT NULL,
    HanNop DATETIME2 NOT NULL,
    TrangThai VARCHAR(20) NOT NULL DEFAULT 'OPEN'
        CONSTRAINT CK_DotBaoCao_TrangThai CHECK (TrangThai IN ('OPEN', 'CLOSED')),
    CreatedBy VARCHAR(20) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_DotBaoCao_HocKy FOREIGN KEY (MaHocKy) REFERENCES dbo.HocKy(MaHocKy),
    CONSTRAINT FK_DotBaoCao_GiangVien FOREIGN KEY (CreatedBy) REFERENCES dbo.GiangVien(MaGiangVien)
);
GO

CREATE TABLE dbo.NopBaoCao
(
    MaNopBaoCao INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    MaBaoCao VARCHAR(20) NOT NULL,
    MaSinhVien VARCHAR(20) NOT NULL,
    DuongDanFile NVARCHAR(300) NULL,
    TenFile NVARCHAR(255) NULL,
    NgayNop DATETIME2 NULL,
    TrangThai VARCHAR(20) NOT NULL DEFAULT 'NOT_SUBMITTED'
        CONSTRAINT CK_NopBaoCao_TrangThai CHECK (TrangThai IN ('NOT_SUBMITTED', 'SUBMITTED', 'APPROVED', 'REJECTED')),
    Diem DECIMAL(4,2) NULL,
    NhanXet NVARCHAR(1000) NULL,
    NguoiCham VARCHAR(20) NULL,
    NgayCham DATETIME2 NULL,
    CONSTRAINT UQ_NopBaoCao_BaoCao_SinhVien UNIQUE (MaBaoCao, MaSinhVien),
    CONSTRAINT FK_NopBaoCao_DotBaoCao FOREIGN KEY (MaBaoCao) REFERENCES dbo.DotBaoCao(MaBaoCao),
    CONSTRAINT FK_NopBaoCao_SinhVien FOREIGN KEY (MaSinhVien) REFERENCES dbo.SinhVien(MaSinhVien),
    CONSTRAINT FK_NopBaoCao_GiangVien FOREIGN KEY (NguoiCham) REFERENCES dbo.GiangVien(MaGiangVien),
    CONSTRAINT CK_NopBaoCao_Diem CHECK (Diem IS NULL OR (Diem >= 0 AND Diem <= 10))
);
GO

CREATE TABLE dbo.ThongBao
(
    MaThongBao INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    TieuDe NVARCHAR(200) NOT NULL,
    NoiDung NVARCHAR(MAX) NOT NULL,
    LoaiNguoiNhan VARCHAR(20) NOT NULL
        CONSTRAINT CK_ThongBao_LoaiNguoiNhan CHECK (LoaiNguoiNhan IN ('ALL', 'ADMIN', 'TEACHER', 'STUDENT')),
    MaNguoiGui VARCHAR(20) NULL,
    NgayGui DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    IsRead BIT NOT NULL DEFAULT 0
);
GO

CREATE INDEX IX_DeTai_MaHocKy ON dbo.DeTai(MaHocKy);
CREATE INDEX IX_DeTai_MaGiangVien ON dbo.DeTai(MaGiangVien);
CREATE INDEX IX_DangKyDeTai_TrangThai ON dbo.DangKyDeTai(TrangThai);
CREATE INDEX IX_NopBaoCao_TrangThai ON dbo.NopBaoCao(TrangThai);
GO

/* Seed du lieu mau */
INSERT INTO dbo.HocKy (MaHocKy, TenHocKy, NgayBatDau, NgayKetThuc, TrangThai)
VALUES
('HK1_24', N'Hoc ky I (2024-2025)', '2024-08-15', '2024-12-31', 'OPEN'),
('HK2_24', N'Hoc ky II (2024-2025)', '2025-01-15', '2025-05-31', 'CLOSED');
GO

INSERT INTO dbo.TaiKhoan (TenDangNhap, MatKhauHash, VaiTro, TrangThai)
VALUES
('admin', '123456', 'ADMIN', 'ACTIVE'),
('gv01', '123456', 'TEACHER', 'ACTIVE'),
('gv02', '123456', 'TEACHER', 'ACTIVE'),
('gv03', '123456', 'TEACHER', 'ACTIVE'),
('sv01', '123456', 'STUDENT', 'ACTIVE'),
('sv02', '123456', 'STUDENT', 'LOCKED'),
('sv03', '123456', 'STUDENT', 'ACTIVE');
GO

INSERT INTO dbo.GiangVien (MaGiangVien, MaTaiKhoan, HoTen, BoMon, Email, SoDienThoai, TrangThai)
VALUES
('GV01', 2, N'Nguyen Van A', N'Cong nghe phan mem', 'gv01@edu.vn', '0901000001', 'ACTIVE'),
('GV02', 3, N'Tran Thi B', N'He thong thong tin', 'gv02@edu.vn', '0901000002', 'ACTIVE'),
('GV03', 4, N'Le Van C', N'An toan thong tin', 'gv03@edu.vn', '0901000003', 'ACTIVE');
GO

INSERT INTO dbo.SinhVien (MaSinhVien, MaTaiKhoan, HoTen, Lop, Email, SoDienThoai, NamHoc, TrangThai)
VALUES
('SV01', 5, N'Nguyen Van C', N'Lop01', 'sv01@edu.vn', '0912000001', 4, 'ACTIVE'),
('SV02', 6, N'Tran Thi B', N'Lop02', 'sv02@edu.vn', '0912000002', 4, 'LOCKED'),
('SV03', 7, N'Pham Minh D', N'Lop03', 'sv03@edu.vn', '0912000003', 4, 'ACTIVE');
GO

INSERT INTO dbo.DeTai (MaDeTai, MaHocKy, MaGiangVien, TenDeTai, MoTa, SoLuongToiDa, TrangThai)
VALUES
('DT01', 'HK1_24', 'GV01', N'Website Thuong mai dien tu', N'Xay dung website ban hang online.', 5, 'OPEN'),
('DT02', 'HK1_24', 'GV02', N'Nhan dien Email Phishing', N'Ung dung machine learning de phat hien email lua dao.', 5, 'OPEN'),
('DT03', 'HK1_24', 'GV03', N'He thong Quan ly Sinh vien', N'Phat trien he thong quan ly thong tin sinh vien.', 5, 'CLOSED');
GO

INSERT INTO dbo.DangKyDeTai (MaDangKy, MaSinhVien, MaDeTai, TrangThai)
VALUES
('DK01', 'SV01', 'DT02', 'PENDING'),
('DK02', 'SV02', 'DT03', 'PENDING');
GO

INSERT INTO dbo.DotBaoCao (MaBaoCao, MaHocKy, TenBaoCao, HanNop, TrangThai, CreatedBy)
VALUES
('BC01', 'HK1_24', N'Bao cao tuan 1', '2026-03-20T23:59:59', 'OPEN', 'GV01'),
('BC02', 'HK1_24', N'Bao cao giua ky', '2026-04-15T23:59:59', 'OPEN', 'GV02');
GO

INSERT INTO dbo.NopBaoCao (MaBaoCao, MaSinhVien, DuongDanFile, TenFile, NgayNop, TrangThai, Diem, NhanXet, NguoiCham, NgayCham)
VALUES
('BC01', 'SV01', N'/uploads/BC01_SV01.pdf', N'BC01_SV01.pdf', '2026-03-18T08:00:00', 'APPROVED', 8.50, N'Bao cao dat yeu cau.', 'GV01', '2026-03-21T09:00:00'),
('BC01', 'SV03', NULL, NULL, NULL, 'NOT_SUBMITTED', NULL, NULL, NULL, NULL);
GO

INSERT INTO dbo.ThongBao (TieuDe, NoiDung, LoaiNguoiNhan, MaNguoiGui, IsRead)
VALUES
(N'Da cham diem bao cao', N'Bao cao BC01 da duoc cham diem.', 'STUDENT', 'GV01', 0),
(N'De tai moi', N'He thong vua cap nhat them de tai thuc tap moi.', 'ALL', 'GV02', 0),
(N'Bao tri he thong', N'He thong se bao tri vao toi Chu Nhat.', 'ALL', 'GV03', 1);
GO

/* View tham khao cho frontend */
CREATE OR ALTER VIEW dbo.vw_TopicSummary
AS
SELECT
    dt.MaDeTai,
    dt.TenDeTai,
    dt.SoLuongToiDa,
    gv.HoTen AS TenGiangVien,
    hk.TenHocKy,
    SUM(CASE WHEN dk.TrangThai = 'APPROVED' THEN 1 ELSE 0 END) AS SoLuongDaDuyet
FROM dbo.DeTai dt
INNER JOIN dbo.GiangVien gv ON gv.MaGiangVien = dt.MaGiangVien
INNER JOIN dbo.HocKy hk ON hk.MaHocKy = dt.MaHocKy
LEFT JOIN dbo.DangKyDeTai dk ON dk.MaDeTai = dt.MaDeTai
GROUP BY dt.MaDeTai, dt.TenDeTai, dt.SoLuongToiDa, gv.HoTen, hk.TenHocKy;
GO

CREATE OR ALTER VIEW dbo.vw_RegistrationApproval
AS
SELECT
    dk.MaDangKy,
    sv.MaSinhVien,
    sv.HoTen AS TenSinhVien,
    dt.MaDeTai,
    dt.TenDeTai,
    dk.TrangThai,
    dk.LyDoTuChoi,
    dk.NgayDangKy,
    dk.NgayDuyet
FROM dbo.DangKyDeTai dk
INNER JOIN dbo.SinhVien sv ON sv.MaSinhVien = dk.MaSinhVien
INNER JOIN dbo.DeTai dt ON dt.MaDeTai = dk.MaDeTai;
GO
