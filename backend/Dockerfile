# 1. Build Aşaması (Uygulamayı derlemek için ağır imaj)
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Bağımlılıkları indir
COPY go.mod go.sum ./
RUN go mod download

# Kodları kopyala ve derle (cmd/api/main.go yolunu kendi projene göre düzenleyebilirsin)
COPY . .
RUN go build -o api cmd/api/main.go

# 2. Çalıştırma Aşaması (Sadece derlenmiş dosyayı çalıştıracak çok hafif imaj)
FROM alpine:latest

WORKDIR /root/

# Build aşamasından sadece oluşan 'api' dosyasını al
COPY --from=builder /app/api .

# Dışarıya 8080 portunu aç
EXPOSE 8080

# Uygulamayı başlat
CMD ["./api"]