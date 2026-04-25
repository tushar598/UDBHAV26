import api from "../../api";

interface ResumeResponse {
    success: boolean;
    file?: Blob;
    fileType?: string;
    fileName?: string;
    error?: string;
}

const getResume = async (userId: string): Promise<ResumeResponse> => {
    try {
        const response = await api.get(`/resume/${userId}`, {
            responseType: "blob", // because backend returns file data
        });

        return {
            success: true,
            file: response.data,
            fileType: response.headers["content-type"] as string | undefined,
            fileName: getFileNameFromHeader(response.headers["content-disposition"] as string | undefined),
        };
    } catch (err) {
        // Use `unknown` for better type safety
        if (isAxiosError(err)) {
            if (err.response?.status === 404) {
                return { success: false, error: "No resume uploaded" };
            }
            console.error(
                "API error while fetching resume:",
                err.response?.data || err.message
            );
            return { success: false, error: "Server error while fetching resume" };
        }

        console.error("Unexpected error:", err);
        return { success: false, error: "Unexpected error occurred" };
    }
};

// Helper: check if it's an Axios error
import { AxiosError } from "axios";

function isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError === true;
}

// Helper: extract file name from header
function getFileNameFromHeader(
    contentDisposition?: string
): string | undefined {
    if (!contentDisposition) return undefined;
    const match = contentDisposition.match(/filename="?([^"]+)"?/);
    return match ? match[1] : undefined;
}

export default getResume;
