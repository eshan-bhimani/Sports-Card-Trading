// In development, Next.js rewrites proxy /api/* to the backend.
// In production, set NEXT_PUBLIC_API_URL to the deployed backend origin.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export interface CropImageResponse {
  success: boolean;
  cropped_image: string;
  confidence: number;
  message: string;
  original_size: [number, number];
  cropped_size: [number, number];
}

export async function cropImage(file: File): Promise<CropImageResponse> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/crop-image`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error(
      "Could not connect to the server. Make sure the backend is running."
    );
  }

  if (!response.ok) {
    // Try to read the FastAPI error detail
    let message: string;
    try {
      const body = await response.json();
      message = body.detail || body.message || body.error;
    } catch {
      // Response wasn't JSON (e.g. Next.js proxy HTML error page)
      message = "";
    }

    if (response.status === 500 && !message) {
      throw new Error(
        "Backend server error. Make sure the Python backend is running on port 8000."
      );
    }

    throw new Error(message || `Request failed (${response.status})`);
  }

  let data: CropImageResponse;
  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid response from server.");
  }

  if (!data.success) {
    throw new Error(data.message || "Image processing failed");
  }

  return data;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
