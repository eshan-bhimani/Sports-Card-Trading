#!/usr/bin/env python3
"""
Debug script - focus on finding the card inside PSA case.
"""
import cv2
import numpy as np
import sys
from pathlib import Path

def debug_inner_card(image_path: str):
    """Find the actual card inside the PSA case."""
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

    # Try to isolate the white/cream card from black background
    # PSA cases have black backgrounds, cards are typically light colored
    _, thresh = cv2.threshold(gray, 40, 255, cv2.THRESH_BINARY)
    cv2.imwrite("debug_threshold.jpg", thresh)
    print("Saved: debug_threshold.jpg")

    # Find contours
    contours, hierarchy = cv2.findContours(
        thresh,
        cv2.RETR_TREE,
        cv2.CHAIN_APPROX_SIMPLE
    )

    print(f"\nFound {len(contours)} contours")

    # Analyze all significant contours
    image_area = image.shape[0] * image.shape[1]
    candidates = []

    for idx, contour in enumerate(contours):
        area = cv2.contourArea(contour)
        area_ratio = area / image_area

        if area_ratio < 0.01 or area_ratio > 0.95:  # Skip tiny and huge contours
            continue

        peri = cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, 0.02 * peri, True)

        x, y, w, h = cv2.boundingRect(contour)
        aspect_ratio = min(w, h) / max(w, h) if max(w, h) > 0 else 0

        has_parent = hierarchy[0][idx][3] != -1 if hierarchy is not None else False

        candidates.append({
            "idx": idx,
            "area_ratio": area_ratio,
            "aspect_ratio": aspect_ratio,
            "vertices": len(approx),
            "has_parent": has_parent,
            "x": x,
            "y": y,
            "w": w,
            "h": h,
            "contour": contour
        })

    # Sort by area (largest first)
    candidates.sort(key=lambda x: x["area_ratio"], reverse=True)

    print(f"\nTop candidates (by area):")
    for i, c in enumerate(candidates[:10]):
        print(f"  {i+1}. area_ratio={c['area_ratio']:.3f}, "
              f"aspect={c['aspect_ratio']:.3f}, "
              f"vertices={c['vertices']}, "
              f"nested={c['has_parent']}")

    # Draw top 5 contours
    if candidates:
        for i in range(min(5, len(candidates))):
            img_copy = image.copy()
            cv2.drawContours(img_copy, [candidates[i]["contour"]], -1, (0, 255, 0), 3)
            x, y, w, h = candidates[i]["x"], candidates[i]["y"], candidates[i]["w"], candidates[i]["h"]
            cv2.rectangle(img_copy, (x, y), (x+w, y+h), (255, 0, 0), 2)
            cv2.imwrite(f"debug_candidate_{i+1}.jpg", img_copy)
            print(f"Saved: debug_candidate_{i+1}.jpg")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python debug_detection2.py <image_path>")
        sys.exit(1)

    debug_inner_card(sys.argv[1])
