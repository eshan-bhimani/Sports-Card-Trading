#!/usr/bin/env python3
"""
Debug script to visualize card detection steps.
"""
import cv2
import numpy as np
import sys
from pathlib import Path

def debug_card_detection(image_path: str):
    """Debug card detection pipeline."""
    img_file = Path(image_path)
    if not img_file.exists():
        print(f"Image not found: {image_path}")
        return

    # Load image
    image = cv2.imread(str(img_file))
    print(f"Loaded image: {img_file.name}")
    print(f"Size: {image.shape[1]}x{image.shape[0]}")

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    cv2.imwrite(f"debug_1_gray.jpg", gray)
    print("Saved: debug_1_gray.jpg")

    # Adaptive threshold
    binary = cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        15, 2
    )
    cv2.imwrite(f"debug_2_binary.jpg", binary)
    print("Saved: debug_2_binary.jpg")

    # Canny edges
    edges1 = cv2.Canny(gray, 30, 100)
    edges2 = cv2.Canny(gray, 50, 150)
    edges3 = cv2.Canny(gray, 100, 200)
    combined_edges = cv2.bitwise_or(edges1, edges2)
    combined_edges = cv2.bitwise_or(combined_edges, edges3)
    cv2.imwrite(f"debug_3_edges.jpg", combined_edges)
    print("Saved: debug_3_edges.jpg")

    # Combined
    combined = cv2.bitwise_or(binary, combined_edges)
    cv2.imwrite(f"debug_4_combined.jpg", combined)
    print("Saved: debug_4_combined.jpg")

    # Morphological operations
    kernel = np.ones((3, 3), np.uint8)
    morph = cv2.morphologyEx(combined, cv2.MORPH_CLOSE, kernel, iterations=2)
    cv2.imwrite(f"debug_5_morph.jpg", morph)
    print("Saved: debug_5_morph.jpg")

    # Find contours
    contours, hierarchy = cv2.findContours(
        morph,
        cv2.RETR_TREE,
        cv2.CHAIN_APPROX_SIMPLE
    )

    print(f"\nFound {len(contours)} contours")

    # Draw all contours
    contour_img = image.copy()
    cv2.drawContours(contour_img, contours, -1, (0, 255, 0), 2)
    cv2.imwrite(f"debug_6_all_contours.jpg", contour_img)
    print("Saved: debug_6_all_contours.jpg (green = all contours)")

    # Analyze contours
    image_area = image.shape[0] * image.shape[1]
    CARD_ASPECT_RATIO = 2.5 / 3.5

    print("\nAnalyzing contours:")
    for idx, contour in enumerate(contours[:20]):  # Only first 20
        area = cv2.contourArea(contour)
        area_ratio = area / image_area

        peri = cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, 0.02 * peri, True)

        x, y, w, h = cv2.boundingRect(contour)
        aspect_ratio = min(w, h) / max(w, h) if max(w, h) > 0 else 0

        if area_ratio > 0.01:  # Only show significant contours
            print(f"  Contour {idx}: area_ratio={area_ratio:.3f}, "
                  f"aspect={aspect_ratio:.3f}, vertices={len(approx)}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python debug_detection.py <image_path>")
        sys.exit(1)

    debug_card_detection(sys.argv[1])
