// Command screenshot is a chromedp example demonstrating how to take a
// screenshot of a specific element and of the entire browser viewport.
package main

import (
	"context"
	"log"
	"os"

	"github.com/chromedp/chromedp"
)

func main() {

	url := os.Args[1]
	path := os.Args[2]

	//url := "http://localhost:8888/bawes/studenthub/staff/web/v1/candidate-id-cards/1/BjE4JvIxqgIO3SiNyNpTPdIzK6YwWLlm"

	//?side=back

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
		chromedp.WithDebugf(log.Printf),
	)
	defer cancel()

	// capture screenshot of an element
	var buf []byte

	if err := chromedp.Run(ctx, elementScreenshot(url, `div.front-card`, &buf)); err != nil {
		log.Fatal(err)
	}
	if err := os.WriteFile(path+"/front.png", buf, 0o644); err != nil {
		log.Fatal(err)
	}

	if err := chromedp.Run(ctx, elementScreenshot(url, `div.back-card`, &buf)); err != nil {
		log.Fatal(err)
	}
	if err := os.WriteFile(path+"/back.png", buf, 0o644); err != nil {
		log.Fatal(err)
	}

	// capture entire browser viewport, returning png with quality=90
	/*if err := chromedp.Run(ctx, fullScreenshot(url, 90, &buf)); err != nil {
		log.Fatal(err)
	}
	if err := os.WriteFile("fullScreenshot.png", buf, 0o644); err != nil {
		log.Fatal(err)
	}*/

	log.Printf("wrote front-card.png and back-card.png")
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
