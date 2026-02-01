#!/usr/bin/env python3
"""
Test script that saves cropped images to disk for visual inspection.
"""
import requests
import json
import base64
import sys
from pathlib import Path

API_URL = "http://localhost:8000/api/crop-image"

def test_and_save_crop(image_path: str):
    """Test cropping and save the result."""
    image_file = Path(image_path)

    if not image_file.exists():
        print(f"❌ Image not found: {image_path}")
        return False

    print(f"\n{'='*60}")
    print(f"Testing: {image_file.name}")
    print(f"Size: {image_file.stat().st_size / 1024:.1f} KB")
    print(f"{'='*60}\n")

    # Upload image
    with open(image_file, 'rb') as f:
        files = {'file': (image_file.name, f, 'image/png')}
        try:
            response = requests.post(API_URL, files=files, timeout=10)
            result = response.json()
        except Exception as e:
            print(f"❌ Request failed: {e}")
            return False

    # Check result
    if result.get('success'):
        print(f"✅ Card detected successfully!")
        print(f"   Confidence: {result['confidence']:.2%}")
        print(f"   Original size: {result['original_size'][0]}x{result['original_size'][1]}")
        print(f"   Cropped size: {result['cropped_size'][0]}x{result['cropped_size'][1]}")

        # Save cropped image
        base64_data = result['cropped_image'].split(',')[1]  # Remove data:image/png;base64, prefix
        image_data = base64.b64decode(base64_data)

        output_path = f"test_images/cropped_{image_file.stem}.png"
        with open(output_path, 'wb') as f:
            f.write(image_data)

        print(f"   Saved to: {output_path}")
        print()
        return True
    else:
        print(f"❌ Card detection failed")
        print(f"   Message: {result.get('message', 'Unknown error')}")
        print()
        return False

def main():
    if len(sys.argv) < 2:
        print("Usage: python test_crop_save.py <image1> [image2] ...")
        print("\nExample:")
        print("  python test_crop_save.py test_images/*.PNG")
        sys.exit(1)

    # Test health endpoint first
    try:
        health = requests.get("http://localhost:8000/health", timeout=2).json()
        print(f"✅ Server is healthy: {health}")
    except:
        print("❌ Server is not running!")
        print("   Start it with: python app.py")
        sys.exit(1)

    # Test each image
    results = []
    for image_path in sys.argv[1:]:
        results.append(test_and_save_crop(image_path))

    # Summary
    print(f"\n{'='*60}")
    print(f"Summary: {sum(results)}/{len(results)} images successfully cropped")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    main()
