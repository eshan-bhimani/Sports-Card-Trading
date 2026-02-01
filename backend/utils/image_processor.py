import cv2
import numpy as np
import base64
from typing import Dict, Tuple, Optional, List
import logging
from io import BytesIO
from PIL import Image

logger = logging.getLogger(__name__)


class CardCropper:
    """Handles detection and cropping of baseball cards from images."""

    # Standard baseball card aspect ratio (2.5" x 3.5" = 0.714)
    CARD_ASPECT_RATIO = 2.5 / 3.5
    ASPECT_RATIO_TOLERANCE = 0.25  # Allow variance for different card types

    # Minimum card area (percentage of image)
    MIN_CARD_AREA_RATIO = 0.01  # Card should be at least 1% of image
    MAX_CARD_AREA_RATIO = 1.00  # Allow cards that fill the frame

    def __init__(self):
        """Initialize the card cropper."""
        logger.info("CardCropper initialized with improved PSA case detection")

    def crop_card(self, image_bytes: bytes) -> Dict:
        """
        Detect and crop a baseball card from an image.
        Optimized for cards in PSA cases - extracts just the card, not the case.

        Args:
            image_bytes: Raw image bytes

        Returns:
            Dictionary containing:
            - success: bool
            - cropped_image: base64 encoded image (if successful)
            - confidence: float (0-1)
            - message: str
            - original_size: tuple (width, height)
            - cropped_size: tuple (width, height)
        """
        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if image is None:
                return {
                    "success": False,
                    "message": "Failed to decode image",
                    "error": "Invalid image format"
                }

            original_h, original_w = image.shape[:2]
            logger.info(f"Processing image of size {original_w}x{original_h}")

            # Detect card with improved algorithm
            card_contour, confidence = self._detect_card_contour_advanced(image)

            if card_contour is None:
                return {
                    "success": False,
                    "message": "No card detected in image. Please ensure the card is clearly visible.",
                    "confidence": 0.0,
                    "original_size": [original_w, original_h]
                }

            # Extract and straighten card
            cropped_card = self._extract_card(image, card_contour)

            if cropped_card is None:
                return {
                    "success": False,
                    "message": "Failed to extract card from image",
                    "confidence": confidence,
                    "original_size": [original_w, original_h]
                }

            # Convert to base64
            cropped_base64 = self._image_to_base64(cropped_card)

            cropped_h, cropped_w = cropped_card.shape[:2]

            return {
                "success": True,
                "cropped_image": cropped_base64,
                "confidence": confidence,
                "message": "Card successfully detected and cropped",
                "original_size": [original_w, original_h],
                "cropped_size": [cropped_w, cropped_h]
            }

        except Exception as e:
            logger.error(f"Error in crop_card: {str(e)}", exc_info=True)
            return {
                "success": False,
                "message": f"Error processing image: {str(e)}",
                "error": str(e)
            }

    def _detect_card_contour_advanced(self, image: np.ndarray) -> Tuple[Optional[np.ndarray], float]:
        """
        Advanced card detection optimized for PSA cases.
        Detects the actual card inside the case, not the case itself.

        Args:
            image: Input image (BGR format)

        Returns:
            Tuple of (contour, confidence_score)
        """
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Determine if image is mostly dark or light
        mean_brightness = np.mean(gray)

        # For dark backgrounds (PSA cases): light cards on dark backgrounds
        if mean_brightness < 100:
            _, thresh = cv2.threshold(gray, 40, 255, cv2.THRESH_BINARY)
        else:
            # For light backgrounds: use edge detection
            thresh = cv2.Canny(gray, 30, 100)
            # Dilate edges to connect them
            kernel = np.ones((3, 3), np.uint8)
            thresh = cv2.dilate(thresh, kernel, iterations=2)

        # Also add Canny edges as supplement
        edges = cv2.Canny(gray, 50, 150)

        # Combine threshold and edges
        combined = cv2.bitwise_or(thresh, edges)

        # Morphological operations to clean up
        kernel = np.ones((5, 5), np.uint8)
        combined = cv2.morphologyEx(combined, cv2.MORPH_CLOSE, kernel, iterations=2)
        combined = cv2.morphologyEx(combined, cv2.MORPH_OPEN, kernel, iterations=1)

        # Find contours
        contours, hierarchy = cv2.findContours(
            combined,
            cv2.RETR_TREE,  # Use RETR_TREE to get hierarchy info
            cv2.CHAIN_APPROX_SIMPLE
        )

        if not contours:
            logger.warning("No contours found in image")
            return None, 0.0

        image_area = image.shape[0] * image.shape[1]
        candidates = []

        # Analyze all contours with hierarchy
        for idx, contour in enumerate(contours):
            # Get contour properties
            area = cv2.contourArea(contour)
            area_ratio = area / image_area

            # Skip contours that are too small or too large
            if area_ratio < self.MIN_CARD_AREA_RATIO or area_ratio > self.MAX_CARD_AREA_RATIO:
                continue

            # Approximate contour to polygon
            peri = cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, 0.02 * peri, True)

            # Get bounding rectangle
            x, y, w, h = cv2.boundingRect(contour)

            # Calculate aspect ratio (width/height normalized to 0-1 range)
            aspect_ratio = min(w, h) / max(w, h) if max(w, h) > 0 else 0

            # Check if it's rectangular (4 corners) or can be approximated as such
            is_rectangular = 4 <= len(approx) <= 8

            if not is_rectangular:
                continue

            # Calculate how well it matches card aspect ratio
            aspect_diff = abs(aspect_ratio - self.CARD_ASPECT_RATIO)

            # Skip if aspect ratio is way off
            if aspect_diff > self.ASPECT_RATIO_TOLERANCE:
                continue

            # Check if contour has a parent (nested inside another contour)
            # This helps identify cards inside cases
            has_parent = hierarchy[0][idx][3] != -1 if hierarchy is not None else False

            # Calculate solidity (how "filled" the shape is)
            hull = cv2.convexHull(contour)
            hull_area = cv2.contourArea(hull)
            solidity = area / hull_area if hull_area > 0 else 0

            # Calculate confidence score
            confidence = self._calculate_confidence_advanced(
                area_ratio=area_ratio,
                aspect_ratio=aspect_ratio,
                num_vertices=len(approx),
                solidity=solidity,
                has_parent=has_parent
            )

            candidates.append({
                "contour": contour,
                "confidence": confidence,
                "area": area,
                "area_ratio": area_ratio,
                "aspect_ratio": aspect_ratio,
                "vertices": len(approx),
                "solidity": solidity,
                "has_parent": has_parent,
                "x": x,
                "y": y,
                "w": w,
                "h": h
            })

            logger.debug(
                f"Candidate: confidence={confidence:.3f}, "
                f"area_ratio={area_ratio:.3f}, "
                f"aspect_ratio={aspect_ratio:.3f}, "
                f"vertices={len(approx)}, "
                f"solidity={solidity:.3f}, "
                f"nested={has_parent}"
            )

        if not candidates:
            logger.warning("No valid card candidates found")
            return None, 0.0

        # Sort by confidence and return best match
        best_candidate = max(candidates, key=lambda x: x["confidence"])

        logger.info(
            f"Best match: confidence={best_candidate['confidence']:.3f}, "
            f"aspect_ratio={best_candidate['aspect_ratio']:.3f}, "
            f"area_ratio={best_candidate['area_ratio']:.3f}, "
            f"nested={best_candidate['has_parent']}"
        )

        return best_candidate["contour"], best_candidate["confidence"]

    def _calculate_confidence_advanced(
        self,
        area_ratio: float,
        aspect_ratio: float,
        num_vertices: int,
        solidity: float,
        has_parent: bool
    ) -> float:
        """
        Advanced confidence scoring optimized for PSA cases.

        Args:
            area_ratio: Ratio of contour area to image area
            aspect_ratio: Aspect ratio of bounding rectangle (normalized)
            num_vertices: Number of vertices in approximated polygon
            solidity: How filled the contour is (area/convex_hull_area)
            has_parent: Whether this contour is nested inside another

        Returns:
            Confidence score between 0 and 1
        """
        confidence = 0.0

        # Aspect ratio match (40% weight) - important but allow for variance
        # PSA cases may have slightly different aspect ratios
        aspect_diff = abs(aspect_ratio - self.CARD_ASPECT_RATIO)
        if aspect_diff < 0.08:
            aspect_score = 1.0
        elif aspect_diff < 0.15:
            aspect_score = 0.95
        elif aspect_diff < 0.20:
            aspect_score = 0.85
        elif aspect_diff < self.ASPECT_RATIO_TOLERANCE:
            aspect_score = 0.75
        else:
            aspect_score = 0.5
        confidence += aspect_score * 0.40

        # Area ratio (30% weight) - flexible for different scenarios
        # PSA cases: 40-70%, raw cards on tables: 5-40%, close-ups: 70-100%
        if 0.40 <= area_ratio <= 0.70:
            # Ideal range for PSA cases
            area_score = 1.0
        elif 0.70 < area_ratio <= 0.95:
            # Close-up shots or cards filling frame
            area_score = 0.98
        elif 0.30 <= area_ratio < 0.40:
            # Smaller cards or wider shots
            area_score = 0.95
        elif 0.15 <= area_ratio < 0.30:
            # Raw cards on tables
            area_score = 0.90
        elif 0.05 <= area_ratio < 0.15:
            # Small cards in larger scenes
            area_score = 0.85
        else:
            # Very small or very large
            area_score = 0.75
        confidence += area_score * 0.30

        # Vertex count (20% weight) - prefer clean 4-corner rectangles
        if num_vertices == 4:
            vertex_score = 1.0
        elif num_vertices == 5:
            vertex_score = 0.95
        elif num_vertices == 6:
            vertex_score = 0.85
        elif num_vertices == 7:
            vertex_score = 0.75
        else:
            vertex_score = 0.65
        confidence += vertex_score * 0.20

        # Solidity (10% weight) - prefer solid rectangular shapes
        if solidity > 0.95:
            solidity_score = 1.0
        elif solidity > 0.90:
            solidity_score = 0.95
        elif solidity > 0.85:
            solidity_score = 0.90
        else:
            solidity_score = max(0.70, solidity)
        confidence += solidity_score * 0.10

        return min(1.0, confidence)

    def _extract_card(self, image: np.ndarray, contour: np.ndarray) -> Optional[np.ndarray]:
        """
        Extract and straighten the card from the image using perspective transform.

        Args:
            image: Original image
            contour: Card contour

        Returns:
            Cropped and straightened card image
        """
        # Get the four corner points
        peri = cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, 0.02 * peri, True)

        if len(approx) < 4:
            logger.warning(f"Insufficient points for perspective transform: {len(approx)}")
            # Fallback: use bounding rectangle
            x, y, w, h = cv2.boundingRect(contour)
            return image[y:y+h, x:x+w]

        # Get corner points
        points = approx.reshape(len(approx), 2) if len(approx) == 4 else self._get_four_corners(approx)
        points = self._order_points(points)

        # Calculate dimensions of the card
        width_top = np.linalg.norm(points[1] - points[0])
        width_bottom = np.linalg.norm(points[2] - points[3])
        height_left = np.linalg.norm(points[3] - points[0])
        height_right = np.linalg.norm(points[2] - points[1])

        max_width = int(max(width_top, width_bottom))
        max_height = int(max(height_left, height_right))

        # Ensure portrait orientation (height > width for standard cards)
        if max_width > max_height:
            max_width, max_height = max_height, max_width

        # Define destination points for perspective transform
        dst_points = np.array([
            [0, 0],
            [max_width - 1, 0],
            [max_width - 1, max_height - 1],
            [0, max_height - 1]
        ], dtype=np.float32)

        # Get perspective transform matrix
        matrix = cv2.getPerspectiveTransform(points.astype(np.float32), dst_points)

        # Apply perspective transform
        warped = cv2.warpPerspective(image, matrix, (max_width, max_height))

        return warped

    def _get_four_corners(self, points: np.ndarray) -> np.ndarray:
        """
        Extract four corner points from a polygon with more than 4 vertices.

        Args:
            points: Array of points

        Returns:
            Array of 4 corner points
        """
        # Find the convex hull
        hull = cv2.convexHull(points)

        # Simplify to 4 points
        peri = cv2.arcLength(hull, True)
        approx = cv2.approxPolyDP(hull, 0.04 * peri, True)

        if len(approx) == 4:
            return approx.reshape(4, 2)

        # If still more than 4, use extreme points
        points_2d = points.reshape(-1, 2)
        top_left = points_2d[np.argmin(points_2d.sum(axis=1))]
        bottom_right = points_2d[np.argmax(points_2d.sum(axis=1))]
        top_right = points_2d[np.argmax(points_2d[:, 0] - points_2d[:, 1])]
        bottom_left = points_2d[np.argmin(points_2d[:, 0] - points_2d[:, 1])]

        return np.array([top_left, top_right, bottom_right, bottom_left])

    def _order_points(self, pts: np.ndarray) -> np.ndarray:
        """
        Order points in top-left, top-right, bottom-right, bottom-left order.

        Args:
            pts: Array of 4 points

        Returns:
            Ordered array of points
        """
        rect = np.zeros((4, 2), dtype=np.float32)

        # Top-left has smallest sum, bottom-right has largest sum
        s = pts.sum(axis=1)
        rect[0] = pts[np.argmin(s)]
        rect[2] = pts[np.argmax(s)]

        # Top-right has smallest difference, bottom-left has largest difference
        diff = np.diff(pts, axis=1)
        rect[1] = pts[np.argmin(diff)]
        rect[3] = pts[np.argmax(diff)]

        return rect

    def _image_to_base64(self, image: np.ndarray) -> str:
        """
        Convert OpenCV image to base64 string with lossless PNG compression.

        Args:
            image: OpenCV image (BGR format)

        Returns:
            Base64 encoded image string
        """
        # Convert BGR to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Convert to PIL Image
        pil_image = Image.fromarray(image_rgb)

        # Save to bytes buffer as PNG (lossless compression)
        # PNG preserves 100% quality while still compressing the file
        buffer = BytesIO()
        pil_image.save(buffer, format="PNG", compress_level=6)  # Level 6 = good compression, fast
        buffer.seek(0)

        # Encode to base64
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

        return f"data:image/png;base64,{image_base64}"
