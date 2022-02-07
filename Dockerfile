FROM golang:alpine
RUN mkdir -p /app
WORKDIR /app
COPY main.go /app/
RUN go build main.go
CMD ["./main"]
