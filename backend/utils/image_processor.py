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
    ASPECT_RATIO_TOLERANCE = 0.25  # Allow 25% variance

    # Minimum card area (percentage of image)
    MIN_CARD_AREA_RATIO = 0.05  # Card should be at least 5% of image

    def __init__(self):
        """Initialize the card cropper."""
        logger.info("CardCropper initialized")

    def crop_card(self, image_bytes: bytes) -> Dict:
        """
        Detect and crop a baseball card from an image.

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

            # Detect card
            card_contour, confidence = self._detect_card_contour(image)

            if card_contour is None:
                return {
                    "success": False,
                    "message": "No card detected in image. Please ensure the card is clearly visible against a contrasting background.",
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

    def _detect_card_contour(self, image: np.ndarray) -> Tuple[Optional[np.ndarray], float]:
        """
        Detect the card contour in the image.

        Args:
            image: Input image (BGR format)

        Returns:
            Tuple of (contour, confidence_score)
        """
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)

        # Apply adaptive thresholding for better edge detection
        # This works better with varied lighting conditions
        binary = cv2.adaptiveThreshold(
            blurred, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            11, 2
        )

        # Also try Canny edge detection
        edges = cv2.Canny(blurred, 50, 150)

        # Combine both methods
        combined = cv2.bitwise_or(binary, edges)

        # Dilate to connect broken edges
        kernel = np.ones((3, 3), np.uint8)
        dilated = cv2.dilate(combined, kernel, iterations=1)

        # Find contours
        contours, _ = cv2.findContours(
            dilated,
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE
        )

        if not contours:
            logger.warning("No contours found in image")
            return None, 0.0

        # Filter and score contours
        image_area = image.shape[0] * image.shape[1]
        candidates = []

        for contour in contours:
            # Approximate contour to polygon
            peri = cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, 0.02 * peri, True)

            # Calculate contour area
            area = cv2.contourArea(contour)
            area_ratio = area / image_area

            # Get bounding rectangle
            x, y, w, h = cv2.boundingRect(contour)
            aspect_ratio = min(w, h) / max(w, h) if max(w, h) > 0 else 0

            # Check if it looks like a card
            # Cards are typically rectangular (4 corners) or can be approximated as such
            is_rectangular = len(approx) >= 4 and len(approx) <= 6
            is_large_enough = area_ratio >= self.MIN_CARD_AREA_RATIO
            aspect_matches = abs(aspect_ratio - self.CARD_ASPECT_RATIO) <= self.ASPECT_RATIO_TOLERANCE

            if is_rectangular and is_large_enough:
                # Calculate confidence score
                confidence = self._calculate_confidence(
                    area_ratio, aspect_ratio, len(approx)
                )

                candidates.append({
                    "contour": contour,
                    "confidence": confidence,
                    "area": area,
                    "aspect_ratio": aspect_ratio,
                    "vertices": len(approx)
                })

                logger.debug(
                    f"Candidate: area_ratio={area_ratio:.3f}, "
                    f"aspect_ratio={aspect_ratio:.3f}, "
                    f"vertices={len(approx)}, "
                    f"confidence={confidence:.3f}"
                )

        if not candidates:
            logger.warning("No valid card candidates found")
            return None, 0.0

        # Sort by confidence and return best match
        best_candidate = max(candidates, key=lambda x: x["confidence"])

        logger.info(
            f"Best candidate: confidence={best_candidate['confidence']:.3f}, "
            f"aspect_ratio={best_candidate['aspect_ratio']:.3f}"
        )

        return best_candidate["contour"], best_candidate["confidence"]

    def _calculate_confidence(
        self,
        area_ratio: float,
        aspect_ratio: float,
        num_vertices: int
    ) -> float:
        """
        Calculate confidence score for a contour being a card.

        Args:
            area_ratio: Ratio of contour area to image area
            aspect_ratio: Aspect ratio of bounding rectangle
            num_vertices: Number of vertices in approximated polygon

        Returns:
            Confidence score between 0 and 1
        """
        confidence = 0.0

        # Score based on aspect ratio match
        aspect_diff = abs(aspect_ratio - self.CARD_ASPECT_RATIO)
        aspect_score = max(0, 1 - (aspect_diff / self.ASPECT_RATIO_TOLERANCE))
        confidence += aspect_score * 0.5  # 50% weight

        # Score based on area (prefer larger areas, but not too large)
        if 0.1 <= area_ratio <= 0.8:
            area_score = 1.0
        elif area_ratio < 0.1:
            area_score = area_ratio / 0.1
        else:
            area_score = max(0, 1 - (area_ratio - 0.8) / 0.2)
        confidence += area_score * 0.3  # 30% weight

        # Score based on number of vertices (prefer 4 corners)
        if num_vertices == 4:
            vertex_score = 1.0
        elif num_vertices == 5:
            vertex_score = 0.8
        else:
            vertex_score = 0.6
        confidence += vertex_score * 0.2  # 20% weight

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
        points = approx.reshape(4, 2) if len(approx) == 4 else self._get_four_corners(approx)
        points = self._order_points(points)

        # Calculate dimensions of the card
        width_top = np.linalg.norm(points[1] - points[0])
        width_bottom = np.linalg.norm(points[2] - points[3])
        height_left = np.linalg.norm(points[3] - points[0])
        height_right = np.linalg.norm(points[2] - points[1])

        max_width = int(max(width_top, width_bottom))
        max_height = int(max(height_left, height_right))

        # Ensure aspect ratio is maintained (standard card ratio)
        if max_width / max_height > 1:
            # Landscape orientation - rotate to portrait
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

        # If still more than 4, use corner detection
        # Get extreme points
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
        Convert OpenCV image to base64 string.

        Args:
            image: OpenCV image (BGR format)

        Returns:
            Base64 encoded image string
        """
        # Convert BGR to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Convert to PIL Image
        pil_image = Image.fromarray(image_rgb)

        # Save to bytes buffer
        buffer = BytesIO()
        pil_image.save(buffer, format="JPEG", quality=95)
        buffer.seek(0)

        # Encode to base64
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

        return f"data:image/jpeg;base64,{image_base64}"
