# Dokumentasi API Manajemen Barang Hilang

## Daftar Isi

- [Autentikasi](#autentikasi)
- [User Management](#user-management)
- [Kategori](#kategori)
- [Lokasi](#lokasi)
- [Laporan](#laporan)
- [Cocok (Pencocokan)](#cocok-pencocokan)
- [Klaim](#klaim)
- [Role & Permission](#role--permission)

---

## Autentikasi

Semua endpoint yang memerlukan autentikasi harus menyertakan header:

```
Authorization: Bearer {token}
```

### Register

**Endpoint:** `POST /api/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "johndoe"
}
```

**Form Data:**

- `foto_identitas` (file, opsional): Foto identitas pengguna

**Response (201):**

```json
{
  "message": "User berhasil didaftarkan",
  "user": {
    "id": "uid123456",
    "username": "johndoe",
    "email": "user@example.com",
    "role": "tamu"
  }
}
```

### Login

**Endpoint:** `POST /api/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFmODhiODE0MjljYzQ1MWEzMzVjMmY1Y2RiM2RmYTQ5YmY5MWU3N2IiLCJ0eXAiOiJKV1QifQ...",
  "user": {
    "id": "uid123456",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "tamu"
  }
}
```

---

## User Management

### Get All Users

**Endpoint:** `GET /api/users`

**Headers:** Memerlukan token autentikasi (semua role dapat mengakses)

**Response (200):**

```json
[
  {
    "id": "uid123456",
    "username": "johndoe",
    "email": "user@example.com",
    "url_foto_identitas": "https://storage.googleapis.com/...",
    "role": "tamu",
    "created_at": "2023-06-21T14:30:00.000Z",
    "created_by": "uid987654"
  }
]
```

### Get User Profile

**Endpoint:** `GET /api/users/profile`

**Headers:** Memerlukan token autentikasi

**Response (200):**

```json
{
  "id": "uid123456",
  "username": "johndoe",
  "email": "user@example.com",
  "url_foto_identitas": "https://storage.googleapis.com/...",
  "role": "tamu",
  "created_at": "2023-06-21T14:30:00.000Z"
}
```

### Get Specific User by ID

**Endpoint:** `GET /api/users/{userId}`

**Headers:** Memerlukan token autentikasi dengan role admin

**Response (200):**

```json
{
  "id": "uid123456",
  "username": "johndoe",
  "email": "user@example.com",
  "url_foto_identitas": "https://storage.googleapis.com/...",
  "role": "tamu",
  "created_at": "2023-06-21T14:30:00.000Z"
}
```

### Create New User

**Endpoint:** `POST /api/users`

**Headers:** Memerlukan token autentikasi dengan role admin

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "username": "newuser",
  "role": "satpam"
}
```

**Form Data:**

- `foto_identitas` (file, opsional): Foto identitas pengguna

**Response (201):**

```json
{
  "message": "User berhasil dibuat",
  "user": {
    "id": "uid789012",
    "username": "newuser",
    "email": "newuser@example.com",
    "role": "satpam"
  }
}
```

### Update User

**Endpoint:** `PUT /api/users/{userId}`

**Headers:** Memerlukan token autentikasi dengan role admin

**Request Body:**

```json
{
  "username": "updated_username",
  "email": "updated@example.com",
  "role": "admin"
}
```

**Form Data:**

- `foto_identitas` (file, opsional): Foto identitas pengguna baru

**Response (200):**

```json
{
  "message": "User berhasil diupdate",
  "user": {
    "id": "uid123456",
    "username": "updated_username",
    "email": "updated@example.com",
    "role": "admin"
  }
}
```

### Delete User

**Endpoint:** `DELETE /api/users/{userId}`

**Headers:** Memerlukan token autentikasi dengan role admin

**Response (200):**

```json
{
  "message": "User berhasil dihapus"
}
```

---

## Kategori

### Get All Kategori

**Endpoint:** `GET /api/kategori`

**Response (200):**

```json
[
  {
    "id_kategori": "kat-a1b2c3d4",
    "nama_kategori": "Elektronik",
    "created_at": "2023-06-21T14:30:00.000Z"
  },
  {
    "id_kategori": "kat-e5f6g7h8",
    "nama_kategori": "Dokumen",
    "created_at": "2023-06-21T14:35:00.000Z"
  }
]
```

### Get Kategori by ID

**Endpoint:** `GET /api/kategori/{id_kategori}`

**Response (200):**

```json
{
  "id_kategori": "kat-a1b2c3d4",
  "nama_kategori": "Elektronik",
  "created_at": "2023-06-21T14:30:00.000Z"
}
```

### Add Kategori

**Endpoint:** `POST /api/kategori`

**Headers:** Memerlukan token autentikasi dengan role admin atau satpam

**Request Body:**

```json
{
  "nama_kategori": "Aksesoris"
}
```

**Response (201):**

```json
{
  "id_kategori": "kat-a1b2c3d4",
  "nama_kategori": "Aksesoris"
}
```

### Update Kategori

**Endpoint:** `PUT /api/kategori/{id_kategori}`

**Headers:** Memerlukan token autentikasi dengan role admin atau satpam

**Request Body:**

```json
{
  "nama_kategori": "Aksesoris Updated"
}
```

**Response (200):**

```json
{
  "id_kategori": "kat-a1b2c3d4",
  "nama_kategori": "Aksesoris Updated",
  "message": "Kategori berhasil diupdate"
}
```

### Delete Kategori

**Endpoint:** `DELETE /api/kategori/{id_kategori}`

**Headers:** Memerlukan token autentikasi dengan role admin atau satpam

**Response (200):**

```json
{
  "message": "Kategori berhasil dihapus"
}
```

---

## Lokasi

### Get All Lokasi

**Endpoint:** `GET /api/lokasi`

**Response (200):**

```json
[
  {
    "id_lokasi_klaim": "loc-a1b2c3d4",
    "lokasi_klaim": "Gedung A",
    "created_at": "2023-06-21T14:30:00.000Z"
  },
  {
    "id_lokasi_klaim": "loc-e5f6g7h8",
    "lokasi_klaim": "Gedung B",
    "created_at": "2023-06-21T14:35:00.000Z"
  }
]
```

### Get Lokasi by ID

**Endpoint:** `GET /api/lokasi/{id_lokasi_klaim}`

**Response (200):**

```json
{
  "id_lokasi_klaim": "loc-a1b2c3d4",
  "lokasi_klaim": "Gedung A",
  "created_at": "2023-06-21T14:30:00.000Z",
  "created_by": "uid123456"
}
```

### Add Lokasi

**Endpoint:** `POST /api/lokasi`

**Headers:** Memerlukan token autentikasi dengan role admin atau satpam

**Request Body:**

```json
{
  "lokasi_klaim": "Gedung C"
}
```

**Response (201):**

```json
{
  "id_lokasi_klaim": "loc-e5f6g7h8",
  "lokasi_klaim": "Gedung C"
}
```

### Update Lokasi

**Endpoint:** `PUT /api/lokasi/{id_lokasi_klaim}`

**Headers:** Memerlukan token autentikasi dengan role admin atau satpam

**Request Body:**

```json
{
  "lokasi_klaim": "Gedung C Lantai 2"
}
```

**Response (200):**

```json
{
  "id_lokasi_klaim": "loc-a1b2c3d4",
  "lokasi_klaim": "Gedung C Lantai 2",
  "message": "Lokasi berhasil diupdate"
}
```

### Delete Lokasi

**Endpoint:** `DELETE /api/lokasi/{id_lokasi_klaim}`

**Headers:** Memerlukan token autentikasi dengan role admin

**Response (200):**

```json
{
  "message": "Lokasi berhasil dihapus"
}
```

---

## Laporan

### Create Laporan

**Endpoint:** `POST /api/laporan`

**Headers:** Memerlukan token autentikasi

**Request Body:**

```json
{
  "id_kategori": "kat-a1b2c3d4",
  "id_lokasi_klaim": "loc-e5f6g7h8",
  "lokasi_kejadian": "Lantai 2 dekat tangga",
  "nama_barang": "Laptop Asus",
  "jenis_laporan": "hilang",
  "deskripsi": "Laptop warna hitam dengan stiker logo kampus"
}
```

**Form Data:**

- `foto` (file, maksimal 3): Foto barang

**Response (201):**

```json
{
  "id_laporan": "lap-a1b2c3d4",
  "message": "Laporan berhasil dibuat"
}
```

### Get Laporan by ID

**Endpoint:** `GET /api/laporan/{id_laporan}`

**Response (200):**

```json
{
  "id_laporan": "lap-a1b2c3d4",
  "id_kategori": "kat-e5f6g7h8",
  "id_user": "uid123456",
  "id_lokasi_klaim": "loc-a1b2c3d4",
  "lokasi_kejadian": "Lantai 2 dekat tangga",
  "nama_barang": "Laptop Asus",
  "jenis_laporan": "hilang",
  "url_foto": [
    "https://storage.googleapis.com/...",
    "https://storage.googleapis.com/..."
  ],
  "deskripsi": "Laptop warna hitam dengan stiker logo kampus",
  "waktu_laporan": "2023-06-21T14:30:00.000Z",
  "status": "proses"
}
```

### Get All Laporan

**Endpoint:** `GET /api/laporan`

**Query Parameters:**

- `jenis_laporan`: Filter berdasarkan jenis (hilang/temuan)
- `status`: Filter berdasarkan status (proses/cocok/selesai)
- `id_kategori`: Filter berdasarkan kategori

**Response (200):**

```json
[
  {
    "id_laporan": "lap-a1b2c3d4",
    "id_kategori": "kat-e5f6g7h8",
    "id_user": "uid123456",
    "nama_barang": "Laptop Asus",
    "jenis_laporan": "hilang",
    "status": "proses",
    "waktu_laporan": "2023-06-21T14:30:00.000Z"
  }
]
```

### Update Status Laporan

**Endpoint:** `PATCH /api/laporan/{id_laporan}/status`

**Headers:** Memerlukan token autentikasi

**Request Body:**

```json
{
  "status": "cocok"
}
```

**Response (200):**

```json
{
  "message": "Status laporan berhasil diupdate"
}
```

### Update Laporan

**Endpoint:** `PUT /api/laporan/{id_laporan}`

**Headers:** Memerlukan token autentikasi dengan role admin

**Request Body:**

```json
{
  "id_kategori": "kat-a1b2c3d4",
  "id_lokasi_klaim": "loc-e5f6g7h8",
  "lokasi_kejadian": "Lantai 2 dekat tangga",
  "nama_barang": "Laptop Asus Updated",
  "jenis_laporan": "hilang",
  "deskripsi": "Laptop warna hitam dengan stiker logo kampus",
  "status": "selesai"
}
```

**Form Data:**

- `foto` (file, maksimal 3): Foto barang baru

**Response (200):**

```json
{
  "message": "Laporan berhasil diupdate",
  "id_laporan": "lap-a1b2c3d4"
}
```

### Delete Laporan

**Endpoint:** `DELETE /api/laporan/{id_laporan}`

**Headers:** Memerlukan token autentikasi dengan role admin

**Response (200):**

```json
{
  "message": "Laporan berhasil dihapus"
}
```

---

## Cocok (Pencocokan)

### Get All Cocok

**Endpoint:** `GET /api/cocok`

**Response (200):**

```json
[
  {
    "id_laporan_cocok": "cocok-a1b2c3d4",
    "id_laporan_hilang": "lap-a1b2c3d4",
    "id_laporan_temuan": "lap-b9c8d7e6",
    "skor_cocok": 85,
    "created_at": "2023-06-21T16:30:00.000Z",
    "created_by": "uid123456"
  }
]
```

### Get Cocok by ID

**Endpoint:** `GET /api/cocok/{id_laporan_cocok}`

**Response (200):**

```json
{
  "id_laporan_cocok": "cocok-a1b2c3d4",
  "id_laporan_hilang": "lap-a1b2c3d4",
  "id_laporan_temuan": "lap-b9c8d7e6",
  "skor_cocok": 85,
  "created_at": "2023-06-21T16:30:00.000Z",
  "created_by": "uid123456"
}
```

### Create Cocok

**Endpoint:** `POST /api/cocok`

**Headers:** Memerlukan token autentikasi dengan role admin atau satpam

**Request Body:**

```json
{
  "id_laporan_hilang": "lap-a1b2c3d4",
  "id_laporan_temuan": "lap-b9c8d7e6",
  "skor_cocok": 85
}
```

**Response (201):**

```json
{
  "id_laporan_cocok": "cocok-a1b2c3d4",
  "id_laporan_hilang": "lap-a1b2c3d4",
  "id_laporan_temuan": "lap-b9c8d7e6",
  "skor_cocok": 85,
  "created_at": "2023-06-21T16:30:00.000Z",
  "created_by": "uid123456",
  "message": "Pencocokan berhasil dibuat"
}
```

### Update Cocok

**Endpoint:** `PUT /api/cocok/{id_laporan_cocok}`

**Headers:** Memerlukan token autentikasi dengan role admin atau satpam

**Request Body:**

```json
{
  "id_laporan_hilang": "lap-a1b2c3d4",
  "id_laporan_temuan": "lap-b9c8d7e6",
  "skor_cocok": 90
}
```

**Response (200):**

```json
{
  "message": "Data pencocokan berhasil diupdate",
  "id_laporan_cocok": "cocok-a1b2c3d4"
}
```

### Delete Cocok

**Endpoint:** `DELETE /api/cocok/{id_laporan_cocok}`

**Headers:** Memerlukan token autentikasi dengan role admin atau satpam

**Response (200):**

```json
{
  "message": "Data pencocokan berhasil dihapus"
}
```

---

## Klaim

### Get All Klaim

**Endpoint:** `GET /api/klaim`

**Headers:** Memerlukan token autentikasi (semua role dapat mengakses)

**Response (200):**

```json
[
  {
    "id_klaim": "klaim-a1b2c3d4",
    "id_laporan_cocok": "cocok-a1b2c3d4",
    "id_satpam": "uid123456",
    "id_penerima": "uid789012",
    "url_foto_klaim": "https://storage.googleapis.com/...",
    "waktu_terima": "2023-06-21T16:30:00.000Z",
    "status": "selesai"
  }
]
```

### Get Klaim by ID

**Endpoint:** `GET /api/klaim/{id_klaim}`

**Headers:** Memerlukan token autentikasi dengan role admin atau satpam

**Response (200):**

```json
{
  "id_klaim": "klaim-a1b2c3d4",
  "id_laporan_cocok": "cocok-a1b2c3d4",
  "id_satpam": "uid123456",
  "id_penerima": "uid789012",
  "url_foto_klaim": "https://storage.googleapis.com/...",
  "waktu_terima": "2023-06-21T16:30:00.000Z",
  "status": "selesai"
}
```

### Create Klaim

**Endpoint:** `POST /api/klaim`

**Headers:** Memerlukan token autentikasi dengan role admin atau satpam

**Request Body:**

```json
{
  "id_laporan_cocok": "cocok-a1b2c3d4",
  "id_penerima": "uid789012"
}
```

**Form Data:**

- `foto_klaim` (file, opsional): Foto bukti serah terima barang

**Response (201):**

```json
{
  "id_klaim": "klaim-a1b2c3d4",
  "message": "Klaim berhasil dibuat dan diselesaikan"
}
```

**Catatan:** Ketika klaim dibuat, sistem otomatis:

- Mengubah status klaim menjadi 'selesai'
- Mengubah status laporan hilang dan temuan terkait menjadi 'selesai'

### Update Klaim

**Endpoint:** `PUT /api/klaim/{id_klaim}`

**Headers:** Memerlukan token autentikasi dengan role admin atau satpam

**Request Body:**

```json
{
  "id_laporan_cocok": "cocok-a1b2c3d4",
  "id_penerima": "uid789012",
  "id_satpam": "uid123456"
}
```

**Form Data:**

- `foto_klaim` (file, opsional): Foto bukti serah terima barang baru

**Response (200):**

```json
{
  "message": "Klaim berhasil diupdate",
  "id_klaim": "klaim-a1b2c3d4"
}
```

### Delete Klaim

**Endpoint:** `DELETE /api/klaim/{id_klaim}`

**Headers:** Memerlukan token autentikasi dengan role admin atau satpam

**Response (200):**

```json
{
  "message": "Klaim berhasil dihapus"
}
```

---

## Role & Permission

### Tamu

- Dapat melakukan registrasi dan login
- Dapat membuat laporan barang hilang/temuan
- Dapat melihat profil sendiri
- Dapat mengupdate status laporan yang dibuat sendiri

### Satpam

- Semua akses seperti Tamu
- Dapat mengelola kategori (CRUD)
- Dapat mengelola lokasi (CRUD, kecuali delete)
- Dapat mengelola pencocokan/cocok (CRUD)
- Dapat mengelola klaim (CRUD)
- Dapat melihat semua laporan

### Admin

- Semua akses seperti Satpam
- Dapat mengelola user (CRUD)
- Dapat mengelola semua laporan (CRUD)
- Dapat menghapus lokasi
- Kontrol penuh terhadap semua data dalam sistem

**Catatan:**

- Semua operasi yang gagal akan mengembalikan kode status yang sesuai (400, 401, 403, 404, 500) dengan pesan error.
- Token autentikasi menggunakan Firebase ID Token yang didapat dari endpoint login.
- File upload menggunakan Google Cloud Storage dengan URL publik.
- Sistem otomatis mengubah status laporan saat ada pencocokan atau klaim.

---
