package storage

import (
	"context"
	"log"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type MinioClient struct {
	Client  *minio.Client
	Buckets []string
}

func NewMinioClient(port, accessKey, secretKey string, buckets []string, useSSL bool) *MinioClient {
	endpoint := "minio:" + port
	log.Println("Connecting to MinIO at", endpoint)
	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: false,
	})
	if err != nil {
		log.Fatalf("MinIO init error: %v", err)
	}

	ctx := context.Background()
	for _, bucket := range buckets {
		exists, err := client.BucketExists(ctx, bucket)
		if err != nil {
			log.Fatalf("MinIO bucket check failed for %s: %v", bucket, err)
		}
		if !exists {
			err := client.MakeBucket(ctx, bucket, minio.MakeBucketOptions{})
			if err != nil {
				log.Fatalf("Can't create bucket %s: %v", bucket, err)
			}
		}
	}

	return &MinioClient{Client: client, Buckets: buckets}
}
