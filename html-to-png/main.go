// Command screenshot is a chromedp example demonstrating how to take a
// screenshot of a specific element and of the entire browser viewport.
package main

import (
	"archive/zip"
	"bytes"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"

	"context"

	"github.com/chromedp/chromedp"
)

func main() {

	// Get the current working directory
	cwd, err := os.Getwd()
	if err != nil {
		log.Fatalf("Error getting current working directory: %v", err)
	}

	// Construct the path to the .env file
	envPath := cwd + "/.env.local"

	err = godotenv.Load(envPath)
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	start := time.Now()

	// Connect to the database
	//db, err := sql.Open("mysql", os.Getenv("DB_USER")+":"+os.Getenv("DB_PASSWORD")+"@tcp("+os.Getenv("DB_HOST")+":"+os.Getenv("DB_PORT")+"/"+os.Getenv("DB_NAME"))
	db, err := sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(%s:%s)/%s", os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_HOST"), os.Getenv("DB_PORT"), os.Getenv("DB_NAME")))
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Query the data and mark as processing
	rows, err := db.Query("SELECT cir_uuid, candidate_ids, created_by FROM candidate_id_request where status = 'pending' limit 1 FOR UPDATE")

	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	// Initialize AWS session
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(os.Getenv("AWS_REGION")),
		Credentials: credentials.NewStaticCredentials(
			os.Getenv("AWS_ACCESS_KEY_ID"),
			os.Getenv("AWS_SECRET_ACCESS_KEY"),
			"",
		),
	})
	if err != nil {
		log.Fatal(err)
	}

	svc := s3.New(sess)

	// create context with custom options
	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("headless", true),
		chromedp.Flag("no-sandbox", true),
		chromedp.Flag("disable-gpu", true),
		chromedp.Flag("disable-crash-reporter", true),
	)

	allocCtx, cancel := chromedp.NewExecAllocator(context.Background(), opts...)
	defer cancel()

	// create context
	ctx, cancel := chromedp.NewContext(
		allocCtx,
		//chromedp.WithDebugf(log.Printf),
	)
	defer cancel()

	// Loop through the data
	for rows.Next() {

		var candidate_ids string
		var cir_uuid string
		var created_by string
		if err := rows.Scan(&cir_uuid, &candidate_ids, &created_by); err != nil {
			log.Fatal(err)
		}

		// update candidate id requests status to 'processing'
		_, err = db.Exec("UPDATE candidate_id_request SET status = 'processing' WHERE cir_uuid = ?", cir_uuid)
		if err != nil {
			log.Fatal(err)
		}

		// Create a buffer to write our archive to.
		zbuf := new(bytes.Buffer)

		// Create a new zip archive.
		zipWriter := zip.NewWriter(zbuf)

		// Loop through the data
		rows, err := db.Query("SELECT id, candidate_id FROM candidate_id_card WHERE candidate_id IN (" + candidate_ids + ")")
		if err != nil {
			log.Fatal(err)
		}
		defer rows.Close()

		for rows.Next() {
			var id string
			var candidate_id string
			if err := rows.Scan(&id, &candidate_id); err != nil {
				log.Fatal(err)
			}

			var token_value string
			err = db.QueryRow("SELECT token_value FROM staff_token WHERE staff_id = ?", created_by).Scan(&token_value)
			if err != nil {
				log.Fatal(err)
			}

			url := fmt.Sprintf("%s/candidate-id-cards/%s/%s", os.Getenv("STAFF_API_ENDPOINT"), id, token_value)

			fmt.Println(url)
			//(1)
			// capture screenshot of an element
			var buf []byte

			if err := chromedp.Run(ctx, elementScreenshot(url, `div.front-card`, &buf)); err != nil {
				log.Fatal(err)
			}

			// Add a file to the archive.
			f, err := zipWriter.Create(fmt.Sprintf("%s/front.png", candidate_id))
			if err != nil {
				log.Fatal(err)
			}

			_, err = f.Write(buf)
			if err != nil {
				log.Fatal(err)
			}

			if err := chromedp.Run(ctx, elementScreenshot(url, `div.back-card`, &buf)); err != nil {
				log.Fatal(err)
			}

			f, err = zipWriter.Create(fmt.Sprintf("%s/back.png", candidate_id))
			if err != nil {
				log.Fatal(err)
			}

			_, err = f.Write(buf)
			if err != nil {
				log.Fatal(err)
			}

			// capture entire browser viewport, returning png with quality=90
			/*if err := chromedp.Run(ctx, fullScreenshot(url, 90, &buf)); err != nil {
				log.Fatal(err)
			}
			if err := os.WriteFile("fullScreenshot.png", buf, 0o644); err != nil {
				log.Fatal(err)
			}*/

		}

		// Make sure to check the error on Close.
		err = zipWriter.Close()
		if err != nil {
			log.Fatal(err)
		}

		// Upload to S3
		_, err = svc.PutObject(&s3.PutObjectInput{
			Bucket: aws.String(os.Getenv("AWS_BUCKET")),
			Key:    aws.String(fmt.Sprintf("id-cards/%s.zip", cir_uuid)),
			Body:   bytes.NewReader(zbuf.Bytes()),
			ACL:    aws.String("public-read"),
		})
		if err != nil {
			log.Fatal(err)
		}

		fmt.Printf("Uploaded id-cards-%s.zip to S3\n", cir_uuid)

		//update candidate id requests status to 'completed'
		_, err = db.Exec("UPDATE candidate_id_request SET status = 'completed' WHERE cir_uuid = ?", cir_uuid)
		if err != nil {
			log.Fatal(err)
		}
	}

	if err := rows.Err(); err != nil {
		log.Fatal(err)
	}

	//total time taken
	elapsed := time.Since(start)
	fmt.Printf("Total time taken: %s\n", elapsed)
	//log.Printf("wrote front-card.png and back-card.png")
}

// elementScreenshot takes a screenshot of a specific element.
func elementScreenshot(urlstr, sel string, res *[]byte) chromedp.Tasks {
	return chromedp.Tasks{
		chromedp.Navigate(urlstr),
		chromedp.Screenshot(sel, res, chromedp.NodeVisible),
	}
}

// fullScreenshot takes a screenshot of the entire browser viewport.
//
// Note: chromedp.FullScreenshot overrides the device's emulation settings. Use
// device.Reset to reset the emulation and viewport settings.
func fullScreenshot(urlstr string, quality int, res *[]byte) chromedp.Tasks {
	return chromedp.Tasks{
		chromedp.Navigate(urlstr),
		chromedp.FullScreenshot(res, quality),
	}
}
