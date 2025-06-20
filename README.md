# Dokumentasi API Manajemen Barang Hilang

## Daftar Isi

- Autentikasi
- User
- Kategori
- Lokasi
- Laporan
- Cocok
- Klaim

---

## Autentikasi

Semua endpoint yang memerlukan autentikasi harus menyertakan header:

```
Authorization: Bearer {token}
```

---

## User

### Register User

**Endpoint:** `POST /api/users/register`

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

### Update User Role

**Endpoint:** `PATCH /api/users/{userId}/role`

**Headers:** Memerlukan token autentikasi dengan role admin

**Request Body:**

```json
{
  "role": "satpam"
}
```

**Response (200):**

```json
{
  "message": "Role user berhasil diupdate"
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

### Add Kategori

**Endpoint:** `POST /api/kategori`

**Headers:** Memerlukan token autentikasi dengan role admin

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

### Delete Kategori

**Endpoint:** `DELETE /api/kategori/{id_kategori}`

**Headers:** Memerlukan token autentikasi dengan role admin

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
  },
  {
    "id_laporan": "lap-b9c8d7e6",
    "id_kategori": "kat-a1b2c3d4",
    "id_user": "uid789012",
    "nama_barang": "KTP",
    "jenis_laporan": "temuan",
    "status": "proses",
    "waktu_laporan": "2023-06-21T15:30:00.000Z"
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

---

## Cocok

**Catatan:** Perlu diperhatikan bahwa route `/api/cocok` saat ini memiliki implementasi yang sama dengan `/api/klaim`. Berikut adalah contoh implementasi yang seharusnya:

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
  "message": "Pencocokan berhasil dibuat"
}
```

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
    "created_at": "2023-06-21T16:30:00.000Z"
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

### Update Skor Cocok

**Endpoint:** `PATCH /api/cocok/{id_laporan_cocok}/skor`

**Headers:** Memerlukan token autentikasi dengan role admin atau satpam

**Request Body:**

```json
{
  "skor_cocok": 90
}
```

**Response (200):**

```json
{
  "message": "Skor kecocokan berhasil diupdate"
}
```

---

## Klaim

### Create Klaim

**Endpoint:** `POST /api/klaim`

**Headers:** Memerlukan token autentikasi dengan role satpam

**Request Body:**

```json
{
  "id_laporan_cocok": "cocok-a1b2c3d4",
  "id_penerima": "uid789012"
}
```

**Form Data:**

- `foto_klaim` (file): Foto bukti serah terima barang

**Response (201):**

```json
{
  "id_klaim": "klaim-a1b2c3d4",
  "message": "Klaim berhasil dibuat"
}
```

### Verifikasi Klaim

**Endpoint:** `PATCH /api/klaim/{id_klaim}/verifikasi`

**Headers:** Memerlukan token autentikasi dengan role satpam (hanya satpam yang membuat klaim)

**Response (200):**

```json
{
  "message": "Klaim berhasil diverifikasi"
}
```

---

**Catatan:**

- Semua operasi yang gagal akan mengembalikan kode status yang sesuai (400, 401, 403, 404, 500) dengan pesan error.
- Route dan implementasi cocok.js perlu diperbaiki karena saat ini menimplementasikan logika yang sama dengan klaim.js.
