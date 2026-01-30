#!/usr/bin/env python3
"""
Simple test script for the Baseball Card Auto-Cropping API.

Usage:
    python test_api.py <image_path>

Example:
    python test_api.py test_images/sample_card.jpg
"""

import sys
import requests
import json
import base64
from pathlib import Path


def test_health_check(base_url: str = "http://localhost:8000"):
    """Test the health check endpoint."""
    print("Testing health check endpoint...")
    try:
        response = requests.get(f"{base_url}/health")
        response.raise_for_status()
        print(f"✓ Health check passed: {response.json()}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"✗ Health check failed: {e}")
        return False


def test_crop_image(image_path: str, base_url: str = "http://localhost:8000"):
    """Test the crop image endpoint."""
    print(f"\nTesting image cropping with: {image_path}")

    # Check if file exists
    if not Path(image_path).exists():
        print(f"✗ Error: File not found: {image_path}")
        return False

    try:
        # Prepare the file
        files = {"file": open(image_path, "rb")}

        # Make request
        print("Uploading image...")
        response = requests.post(f"{base_url}/api/crop-image", files=files)

        # Parse response
        result = response.json()

        if response.status_code == 200 and result.get("success"):
            print(f"✓ Card successfully cropped!")
            print(f"  - Confidence: {result['confidence']:.2f}")
            print(f"  - Original size: {result['original_size'][0]}x{result['original_size'][1]}")
            print(f"  - Cropped size: {result['cropped_size'][0]}x{result['cropped_size'][1]}")
            print(f"  - Message: {result['message']}")

            # Optionally save the cropped image
            save_cropped = input("\nSave cropped image? (y/n): ").lower().strip()
            if save_cropped == 'y':
                save_result(result, image_path)

            return True
        else:
            print(f"✗ Card cropping failed")
            print(f"  - Status code: {response.status_code}")
            print(f"  - Message: {result.get('message', 'Unknown error')}")
            if 'error' in result:
                print(f"  - Error: {result['error']}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"✗ Request failed: {e}")
        return False
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        return False


def save_result(result: dict, original_path: str):
    """Save the cropped image to disk."""
    try:
        # Extract base64 data
        base64_data = result["cropped_image"].split(",")[1]
        image_bytes = base64.b64decode(base64_data)

        # Create output filename
        original_file = Path(original_path)
        output_path = original_file.parent / f"{original_file.stem}_cropped{original_file.suffix}"

        # Save file
        with open(output_path, "wb") as f:
            f.write(image_bytes)

        print(f"✓ Cropped image saved to: {output_path}")

        # Also save metadata
        metadata_path = original_file.parent / f"{original_file.stem}_metadata.json"
        metadata = {
            "original_file": str(original_path),
            "cropped_file": str(output_path),
            "confidence": result["confidence"],
            "original_size": result["original_size"],
            "cropped_size": result["cropped_size"],
            "message": result["message"]
        }
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)

        print(f"✓ Metadata saved to: {metadata_path}")

    except Exception as e:
        print(f"✗ Failed to save result: {e}")


def main():
    """Main test function."""
    print("=" * 60)
    print("Baseball Card Auto-Cropping API Test")
    print("=" * 60)

    # Check if server is accessible
    base_url = "http://localhost:8000"

    if not test_health_check(base_url):
        print("\n⚠ Server is not running or not accessible")
        print("Start the server with: python app.py")
        sys.exit(1)

    # Get image path from command line
    if len(sys.argv) < 2:
        print("\nUsage: python test_api.py <image_path>")
        print("Example: python test_api.py test_images/sample_card.jpg")
        sys.exit(1)

    image_path = sys.argv[1]

    # Test image cropping
    success = test_crop_image(image_path, base_url)

    print("\n" + "=" * 60)
    if success:
        print("✓ All tests passed!")
    else:
        print("✗ Some tests failed")
    print("=" * 60)

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
